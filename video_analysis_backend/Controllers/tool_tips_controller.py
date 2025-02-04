import os
import time
import threading
import dotenv
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import socketio
# from app import handle_message

# Load environment variables
dotenv.load_dotenv()

# Configure Generative AI API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Set up generation config
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

# Initialize the generative model
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    generation_config=generation_config,
    system_instruction=(
        "You are an advanced AI assistant specializing in baseball analytics. "
        "Your task is to analyze the provided live or recorded baseball footage and deliver real-time insights "
        "to enhance the viewer's experience. For each play or strategic occurrence, provide detailed insights "
        "with the following information:\n\n"
        "Description: A detailed explanation of the strategy or play, including its significance, purpose, and possible outcomes.\n"
        "Key Players: The full names and roles of the players involved in the strategy.\n"
        "Impact Analysis: How the strategy could influence the game, including potential advantages or risks.\n"
        "Timestamp: The exact time in the video when the strategy is executed or becomes apparent.\n\n"
        "Ensure that the insights are contextual, easy to understand for viewers, and highlight the depth of the game strategies, "
        "such as pitch selection, defensive alignment, base-running tactics, or managerial decisions."
    ),
)

# Store uploaded videos in a temporary directory
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def upload_tool_tips():
    """
    Endpoint to upload video from the React app.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    video_file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, video_file.filename)
    video_file.save(file_path)

    # Start processing the video asynchronously
    threading.Thread(target=process_video, args=(file_path,)).start()

    return jsonify({"message": "Video uploaded successfully", "file_name": video_file.filename}), 200


def process_video(file_path):
    """
    Process the uploaded video and generate tooltips asynchronously.
    """
    print(f"Processing video: {file_path}")
    video_file = upload_and_process_video(file_path)

    # Simulate reading timestamps from the video for demonstration
    fps = 30  # Assume 30 FPS for the video
    duration = 300  # Assume a 5-minute video
    timestamps = [t for t in range(0, duration, 10)]  # Generate timestamps every 10 seconds

    for timestamp in timestamps:
        # Generate tooltip for the current timestamp
        time.sleep(10)  # Simulate delay in processing
        tooltip = generate_tooltip(video_file, timestamp)
        try:
            from app import handle_message
            handle_message(timestamp,tooltip)
            print(f"Emitted tooltip for timestamp {timestamp}")
        except Exception as e:
            print(e)


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


