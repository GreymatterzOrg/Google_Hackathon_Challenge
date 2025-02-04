import ssl
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import time
import google.generativeai as genai
from dotenv import load_dotenv
import subprocess
import re
from Controllers.image_gallery_controller import extract_players, save_files, get_file, upload_file, query_file, generate_clips, upload_file_query
from Controllers.tool_tips_controller import upload_tool_tips
from Controllers.user_controller import authenticate_user, get_user_details, update_user_details, social_login, change_password, forgot_password, verify_otp
from Controllers.google_auth import *
from Controllers.google_drive_integration import *
from Controllers.gallery_playlist_controller import *
import os
import time
import threading
import dotenv
import google.generativeai as genai
from flask import Flask, request, jsonify
from moviepy.video.io.VideoFileClip import VideoFileClip
from flask_socketio import SocketIO, emit

# Initialize Flask app
app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Enable CORS for the app
CORS(app,origins='*')
socketio = SocketIO(app, cors_allowed_origins="*")

# Load environment variables
load_dotenv()

# Configure the Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set.")
genai.configure(api_key=api_key)

# Generation configuration
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

# Create the GenerativeModel
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    generation_config=generation_config,
    system_instruction="""You are an advanced AI assistant specializing in baseball analytics. Your task is to analyze the provided live or recorded baseball footage and deliver real-time insights to enhance the viewer's experience..."""
)


@app.route('/authUser', methods=['POST'])
def auth():
    return authenticate_user()

@app.route('/auth/change-password', methods=['POST'])
def change_password_route():
    return change_password()

@app.route('/user/<user_id>', methods=['GET'])
def get_user(user_id):
    return get_user_details(user_id)

@app.route('/user/update', methods=['PUT'])
def update_user():
    return update_user_details()

@app.route('/auth/verify-otp', methods=['POST'])
def verify_otp_route():
    return verify_otp()

@app.route('/auth/forgot-password', methods=['POST'])
def forgot_password_route():
    return forgot_password()

@app.route('/auth/social-login', methods=['POST'])
def social_login_route():
    return social_login()

# video processing routes
app.route("/upload", methods=["POST"])(upload_file)
app.route("/upload-query", methods=["POST"])(upload_file_query)
app.route("/generate_clips", methods=["POST"])(generate_clips)
app.route("/query", methods=["POST"])(query_file)

#extract-players
app.route("/extract-players", methods=["POST"])(extract_players)

# gallery routes 
app.route("/save-files", methods=["POST"])(save_files)
app.route("/get-file", methods=["GET"])(get_file)

# google drive implementation
app.route('/add-gmail', methods=['GET'])(gmail_login)
app.route('/callback', methods=['GET'])(gmail_callback)
app.route('/save-in-drive', methods = ['POST'])(save_media_in_drive)
app.route('/get-drive-folders', methods = ['GET'])(get_drive_folders)
# playlist routes 
app.route('/playlist', methods=['POST'])(create_playlist)
app.route('/playlists/<user_id>', methods=['GET'])(get_all_playlists)
app.route('/playlist/<playlist_id>', methods=['GET'])(get_playlist)
app.route('/playlist/<playlist_id>', methods=['DELETE'])(delete_playlist)


def upload_and_process_video(file_path):
    """
    Upload the video file to the Generative AI API for processing.
    """
    print("Uploading file...")
    video_file = genai.upload_file(path=file_path)
    print(f"Uploaded file name: {video_file.name}")

    # Wait until processing is complete
    while video_file.state.name == "PROCESSING":
        time.sleep(10)
        video_file = genai.get_file(video_file.name)

    if video_file.state.name == "FAILED":
        raise ValueError(f"File processing failed: {video_file.state.name}")

    return video_file



@app.route("/upload-tool-tips", methods=["POST"])
def upload_video():
    """
    Endpoint to upload video from the React app.
    """
    user_id = request.form.get("user_id")  
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    video_file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, video_file.filename)
    video_file.save(file_path)

    # Start processing the video asynchronously
    threading.Thread(target=process_video, args=(file_path, user_id)).start()

    return jsonify({"message": "Video uploaded successfully", "file_name": video_file.filename}), 200


def process_video(file_path, user_id):
    """
    Process the uploaded video and generate tooltips asynchronously.
    """
    print(f"Processing video: {file_path}")
    video_file = upload_and_process_video(file_path)

    # Get the actual duration of the video
    try:
        with VideoFileClip(file_path) as video_clip:
            duration = int(video_clip.duration)  # Duration in seconds
            print(duration)
            fps = int(video_clip.fps)  # FPS of the video
    except Exception as e:
        print(f"Error retrieving video metadata: {e}")
        return

    timestamps = [t for t in range(0, duration, 10)]  # Generate timestamps every 10 seconds

    for timestamp in timestamps:
        # Generate tooltip for the current timestamp
        time.sleep(10)  # Simulate delay in processing
        tooltip = generate_tooltip(video_file, timestamp)
        
        # Emit the tooltip only to the specific user via their user_id
        socketio.emit("tooltip", {"timestamp": timestamp, "tooltip": tooltip}, room=user_id)
        print(f"Emitted tooltip for timestamp {timestamp} to user {user_id}")


def generate_tooltip(video_file, frame_timestamp):
    """
    Generate a tooltip for a specific timestamp in the video.
    """
    prompt = (
        f"At timestamp {frame_timestamp}, provide a detailed insight explaining the play or strategy "
        f"happening in the baseball game. Mention the full names of the players, their actions, and any pitch details if applicable."
    )
    try:
        response = model.generate_content([video_file, prompt])
        tooltip = response.text.strip()
        print(f"[Generated Tooltip] {tooltip}")
        return tooltip
    except Exception as e:
        print(f"Error generating tooltip: {e}")
        return "No tooltip available at the moment."

@app.route("/files/<id>/<filename>")
def download_file_path_user(id, filename):
    try:
        folderpath = "files" 
        if filename:
            return send_file(f"{folderpath}/{id}/{filename}", as_attachment=False)
        else:
            return False
    except FileNotFoundError:
        return "File not found!", 404
    
@app.route("/clips/<filename>")
def download_video_file(filename):
    try:
        folderpath = "clips" 
        if filename:
            return send_file(f"{folderpath}/{filename}", as_attachment=False)
        else:
            return False
    except FileNotFoundError:
        return "File not found!", 404



# Load SSL context for HTTPS
ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
# ssl_context.load_cert_chain(certfile='./SSL_python/combine.crt', keyfile='./SSL_python/sourcesoftsolutions.com.key')
ssl_context.load_cert_chain(certfile='local.crt', keyfile='local.key')

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
    # socketio.run(app, debug=True, host='0.0.0.0', port=5000, use_reloader=False, ssl_context=ssl_context, allow_unsafe_werkzeug=True)