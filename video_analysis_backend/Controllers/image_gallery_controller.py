import shutil
from flask import Flask, request, jsonify
import google.generativeai as genai
from Models.image_gallery_model import ImageGallery
import os
import time
from dotenv import load_dotenv
import subprocess
import re
from bson import ObjectId

# Configure the Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set.")
genai.configure(api_key=api_key)

# serialize data
def serialize(data):
    """Convert non-serializable fields to serializable format."""
    if isinstance(data, list):
        return [serialize(item) for item in data]
    elif isinstance(data, dict):
        return {key: serialize(value) for key, value in data.items()}
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data



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

# save files in gallery
def save_files():
    """
    Save file screenshots, clips, and file_id in the database.
    """
    data = request.json

    # Validate input
    if not data or 'file_id' not in data or 'screenshots' not in data or 'clips' not in data or 'user_id' not in data:
        return jsonify({"error": "Missing 'file_id', 'screenshots', or 'clips' or 'user_id' in data provided"}), 400

    file_id = data['file_id']
    user_id = data['user_id']
    screenshots = data['screenshots']
    clips = data['clips']

    # Validate screenshots
    if not isinstance(screenshots, list) or not all(isinstance(url, str) for url in screenshots):
        return jsonify({"error": "'screenshots' should be a list of strings"}), 400

    # Validate clips
    if not isinstance(clips, list) or not all(isinstance(url, str) for url in clips):
        return jsonify({"error": "'clips' should be a list of strings"}), 400

    try:
        # Save file information in the database
        file_record = ImageGallery(user_id=user_id, file_id=file_id, screenshots=screenshots, clips=clips)
        file_record.save()

        return jsonify({"message": "File information saved successfully", "file_id": file_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# get files from gallery
def get_file():
    """
    Retrieve file URLs based on file_id.
    """
    try:
        user_id=request.args.get("user_id")
        file_data = ImageGallery.find_one({"user_id":ObjectId(user_id)})
        if not file_data:
            return jsonify({"status":False, "message": "File not found"}), 404

        return jsonify({"status":True, "data": serialize(file_data)}), 200
    except Exception as e:
        return jsonify({"status":False,"message": str(e)}), 500

# upload file
# def upload_file():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file part in the request"}), 400

#     file = request.files['file']
#     user_prompt = request.form.get('user_prompt')
#     clip_duration = request.form.get('clip_duration',5)
#     user_id = request.form.get('user_id')

#     # Validate input
#     if not file or not user_prompt or not clip_duration or not user_id:
#         return jsonify({"error": "Missing 'file', 'user_prompt', or 'clip_duration' or 'user_id' in data provided"}), 400


#     if file.filename == '':
#         return jsonify({"error": "No file selected for uploading"}), 400

#     try:
#         # Save the uploaded file temporarily
#         file_path = os.path.join("/tmp", file.filename)
#         file.save(file_path)

#         print("Uploading file...")
#         video_file = genai.upload_file(path=file_path)

#         # Wait for processing to complete
#         while video_file.state.name == "PROCESSING":
#             print('.', end='', flush=True)
#             time.sleep(10)
#             video_file = genai.get_file(video_file.name)

#         # Check for failure
#         if video_file.state.name == "FAILED":
#             return jsonify({"error": "Video processing failed"}), 500

#         # Prompt for the best moments
#         prompt = f"{user_prompt}.The timestamps should come in this format ['00:00:03', '00:00:10', '00:00:12', '00:00:14', '00:00:23']"
#         response = model.generate_content([video_file, prompt], request_options={"timeout": 600})

#         print(response.text)

#         # Parse the timestamps from the response using regex
#         try:
#             timestamps = re.findall(r"\[?(\d{2}:\d{2}:\d{2})\]?", response.text)
#         except Exception as e:
#             raise ValueError("Failed to parse timestamps from the response:", response.text) from e

#         if not timestamps:
#             raise ValueError("No valid timestamps found in the response:", response.text)

#         print("Timestamps identified:", timestamps)

#         # Create folders for screenshots and clips
#         base_folder = f"{video_file.name}"
#         screenshots_folder = os.path.join(base_folder)
#         clips_folder = os.path.join(base_folder)
#         os.makedirs(screenshots_folder, exist_ok=True)
#         os.makedirs(clips_folder, exist_ok=True)

#         # Capture screenshots at the specified timestamps using ffmpeg
#         screenshot_paths = []
#         for i, timestamp in enumerate(timestamps):
#             screenshot_output = os.path.join(screenshots_folder, f"screenshot_{i+1}.png")
#             command = [
#                 "ffmpeg", "-y", "-i", file_path, "-ss", timestamp, "-vframes", "1", screenshot_output
#             ]
#             try:
#                 subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#                 print(f"Screenshot saved at: {screenshot_output}")
#                 screenshot_paths.append(screenshot_output)
#             except subprocess.CalledProcessError as e:
#                 print(f"Failed to capture screenshot at {timestamp}: {e}")

#         # Extract video clips at the specified timestamps using ffmpeg
#         clip_duration 
#         clip_paths = []
#         for i, timestamp in enumerate(timestamps):
#             clip_output = os.path.join(clips_folder, f"clip_{i+1}.mp4")
#             command = [
#                 "ffmpeg", "-y", "-i", file_path, "-ss", timestamp, "-t", str(clip_duration), "-c", "copy", clip_output
#             ]
#             try:
#                 subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#                 print(f"Clip saved at: {clip_output}")
#                 clip_paths.append(clip_output)
#             except subprocess.CalledProcessError as e:
#                 print(f"Failed to extract clip at {timestamp}: {e}")

#         return jsonify({
#             "message": "File uploaded and processed successfully",
#             "file_id": video_file.name,
#             "timestamps": timestamps,
#             "screenshots": screenshot_paths,
#             "user_id":user_id,
#             "clips": clip_paths
#         }), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    user_prompt = request.form.get('user_prompt')
    clip_duration = request.form.get('clip_duration', 5)
    user_id = request.form.get('user_id')

    # Validate input
    if not file or not user_prompt or not clip_duration or not user_id:
        return jsonify({"error": "Missing 'file', 'user_prompt', 'clip_duration', or 'user_id' in data provided"}), 400

    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400

    try:
        # Save the uploaded file temporarily
        original_file_name = file.filename
        temp_file_path = os.path.join("/tmp", original_file_name)
        file.save(temp_file_path)

        print("Uploading file...")
        video_file = genai.upload_file(path=temp_file_path)

        # Wait for processing to complete
        while video_file.state.name == "PROCESSING":
            print('.', end='', flush=True)
            time.sleep(10)
            video_file = genai.get_file(video_file.name)

        # Check for failure
        if video_file.state.name == "FAILED":
            return jsonify({"error": "Video processing failed"}), 500

        # Prompt for the best moments
        prompt = f"{user_prompt}. The timestamps should come in this format ['00:00:03', '00:00:10', '00:00:12', '00:00:14', '00:00:23']"
        response = model.generate_content([video_file, prompt], request_options={"timeout": 600})

        print(response.text)

        # Parse the timestamps from the response using regex
        try:
            timestamps = re.findall(r"\[?(\d{2}:\d{2}:\d{2})\]?", response.text)
        except Exception as e:
            raise ValueError("Failed to parse timestamps from the response:", response.text) from e

        if not timestamps:
            raise ValueError("No valid timestamps found in the response:", response.text)

        print("Timestamps identified:", timestamps)

        # Create folders for storing files
        base_folder = f"{video_file.name}"
        os.makedirs(base_folder, exist_ok=True)

        # Save the original video file in the base folder
        original_video_path = os.path.join(base_folder, original_file_name)
        shutil.copy(temp_file_path, original_video_path)
        print(f"Original video saved at: {original_video_path}")

        # Capture screenshots at the specified timestamps using ffmpeg
        screenshot_paths = []
        for i, timestamp in enumerate(timestamps):
            screenshot_output = os.path.join(base_folder, f"screenshot_{i+1}.png")
            command = [
                "ffmpeg", "-y", "-i", temp_file_path, "-ss", timestamp, "-vframes", "1", screenshot_output
            ]
            try:
                subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                print(f"Screenshot saved at: {screenshot_output}")
                screenshot_paths.append(screenshot_output)
            except subprocess.CalledProcessError as e:
                print(f"Failed to capture screenshot at {timestamp}: {e}")

        # Extract video clips at the specified timestamps using ffmpeg
        clip_paths = []
        for i, timestamp in enumerate(timestamps):
            clip_output = os.path.join(base_folder, f"clip_{i+1}.mp4")
            command = [
                "ffmpeg", "-y", "-i", temp_file_path, "-ss", timestamp, "-t", str(clip_duration), "-c", "copy", clip_output
            ]
            try:
                subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                print(f"Clip saved at: {clip_output}")
                clip_paths.append(clip_output)
            except subprocess.CalledProcessError as e:
                print(f"Failed to extract clip at {timestamp}: {e}")

        return jsonify({
            "message": "File uploaded and processed successfully",
            "file_id": video_file.name,
            "original_video": original_video_path,
            "timestamps": timestamps,
            "screenshots": screenshot_paths,
            "user_id": user_id,
            "clips": clip_paths
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# def upload_file_query():
#     print(1)
#     if 'file' not in request.files:
#         return jsonify({"error": "No file part in the request"}), 400

#     file = request.files['file']
#     # user_prompt = request.form.get('user_prompt')
#     # clip_duration = request.form.get('clip_duration',5)
#     user_id = request.form.get('user_id')

#     # Validate input
#     if not file or not user_id:
#         return jsonify({"error": "Missing 'file', 'user_prompt', or 'clip_duration' or 'user_id' in data provided"}), 400


#     if file.filename == '':
#         return jsonify({"error": "No file selected for uploading"}), 400

#     try:
#         # Save the uploaded file temporarily
#         file_path = os.path.join("/tmp", file.filename)
#         file.save(file_path)

#         print("Uploading file...")
#         video_file = genai.upload_file(path=file_path)

#         # Wait for processing to complete
#         while video_file.state.name == "PROCESSING":
#             print('.', end='', flush=True)
#             time.sleep(10)
#             video_file = genai.get_file(video_file.name)

#         # Check for failure
#         if video_file.state.name == "FAILED":
#             return jsonify({"error": "Video processing failed"}), 500

#         # Prompt for the best moments
#         prompt = "The timestamps should come in this format ['00:00:03', '00:00:10', '00:00:12', '00:00:14', '00:00:23']"
#         response = model.generate_content([video_file, prompt], request_options={"timeout": 600})

#         print(response.text)

#         # Parse the timestamps from the response using regex
#         try:
#             timestamps = re.findall(r"\[?(\d{2}:\d{2}:\d{2})\]?", response.text)
#         except Exception as e:
#             raise ValueError("Failed to parse timestamps from the response:", response.text) from e

#         if not timestamps:
#             raise ValueError("No valid timestamps found in the response:", response.text)

#         print("Timestamps identified:", timestamps)

#         # Create folders for screenshots and clips
#         base_folder = f"{video_file.name}"
#         screenshots_folder = os.path.join(base_folder)
#         clips_folder = os.path.join(base_folder)
#         os.makedirs(screenshots_folder, exist_ok=True)
#         os.makedirs(clips_folder, exist_ok=True)

#         # Capture screenshots at the specified timestamps using ffmpeg
#         screenshot_paths = []
#         for i, timestamp in enumerate(timestamps):
#             screenshot_output = os.path.join(screenshots_folder, f"screenshot_{i+1}.png")
#             command = [
#                 "ffmpeg", "-y", "-i", file_path, "-ss", timestamp, "-vframes", "1", screenshot_output
#             ]
#             try:
#                 subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#                 print(f"Screenshot saved at: {screenshot_output}")
#                 screenshot_paths.append(screenshot_output)
#             except subprocess.CalledProcessError as e:
#                 print(f"Failed to capture screenshot at {timestamp}: {e}")

#         # Extract video clips at the specified timestamps using ffmpeg
#         # clip_duration 
#         clip_paths = []
#         for i, timestamp in enumerate(timestamps):
#             clip_output = os.path.join(clips_folder, f"clip_{i+1}.mp4")
#             command = [
#                 "ffmpeg", "-y", "-i", file_path, "-ss", timestamp, "-t", str(5), "-c", "copy", clip_output
#             ]
#             try:
#                 subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#                 print(f"Clip saved at: {clip_output}")
#                 clip_paths.append(clip_output)
#             except subprocess.CalledProcessError as e:
#                 print(f"Failed to extract clip at {timestamp}: {e}")

#         return jsonify({
#             "message": "File uploaded and processed successfully",
#             "file_id": video_file.name,
#             "timestamps": timestamps,
#             "screenshots": screenshot_paths,
#             "user_id":user_id,
#             "clips": clip_paths
#         }), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


def upload_file_query():
    print(1)
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    user_id = request.form.get('user_id')

    # Validate input
    if not file or not user_id:
        return jsonify({"error": "Missing 'file' or 'user_id' in data provided"}), 400

    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400

    try:
        # Save the uploaded file temporarily
        file_path = os.path.join("/tmp", file.filename)
        file.save(file_path)

        print("Uploading file...")
        video_file = genai.upload_file(path=file_path)

        # Wait for processing to complete
        while video_file.state.name == "PROCESSING":
            print('.', end='', flush=True)
            time.sleep(10)
            video_file = genai.get_file(video_file.name)

        # Check for failure
        if video_file.state.name == "FAILED":
            return jsonify({"error": "Video processing failed"}), 500

        # AI Prompt to extract player names
        prompt = "Give the full name of all the players in the video. Only list the full names, separated by commas."
        response = model.generate_content([video_file, prompt], request_options={"timeout": 600})
        
        # Extract player names using regex
        players = extract_player_names(response.text)

        return jsonify({
            "message": "File uploaded and processed successfully",
            "file_id": video_file.name,
            "user_id": user_id,
            "players": players
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def generate_clips():
    if 'file' not in request.files:
        return jsonify({"error": "File not provided. Please upload a video file."}), 400

    file = request.files['file']
    start_timestamp = request.form.get('start_timestamp')
    end_timestamp = request.form.get('end_timestamp')
    user_id = request.form.get('user_id')

    if not start_timestamp or not end_timestamp:
        return jsonify({"error": "Timestamps not provided. 'start_timestamp' and 'end_timestamp' are required."}), 400

    # Save the uploaded file
    input_folder = "uploads"
    os.makedirs(input_folder, exist_ok=True)
    file_path = os.path.join(input_folder, file.filename)
    file.save(file_path)

    # Prepare output folder
    clips_folder = "clips"
    os.makedirs(clips_folder, exist_ok=True)

    # Generate the clip with a timestamped filename
    timestamp = int(time.time())
    output_filename = f"clip_{timestamp}.mp4"
    output_path = os.path.join(clips_folder, output_filename)

    command = [
        "ffmpeg", "-y", "-i", file_path, "-ss", start_timestamp, "-to", end_timestamp, "-c", "copy", output_path
    ]

    try:
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"Clip saved at: {output_path}")
        return jsonify({
            "message": "Clip generated successfully",
            "clip_path": output_path
        }), 200
    except subprocess.CalledProcessError as e:
        print(f"Failed to generate clip: {e}")
        return jsonify({"error": "Failed to generate clip."}), 500
    

# query on video
def query_file():
    data = request.json

    # Validate input
    if not data or 'file_id' not in data or 'prompt' not in data:
        return jsonify({"error": "Missing 'file_id' or 'prompt' in request body"}), 400

    file_id = data['file_id']
    prompt = data['prompt']
    user_id = data['user_id']

    try:
        # Fetch the file using the file ID
        video_file = genai.get_file(file_id)

        # if video_file.state.name != "SUCCEEDED":
        #     return jsonify({"error": "File is not ready for querying"}), 400

        # Generate response from the model
        response = model.generate_content(
            [video_file, prompt],
            request_options={"timeout": 600}
        )

        return jsonify({"response": response.text}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def extract_player_names(text):
    """
    Extracts only valid player names from the AI response using regex.
    """
    # Replace newlines and clean the text
    text = text.replace("\n", " ")

    # Regular expression to match proper names (e.g., "Mike Trout", "Aaron Judge")
    name_pattern = re.findall(r"\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b", text)

    # Remove duplicates and return a clean list
    return list(set(name_pattern))

def extract_players():
    if 'video' not in request.files:
        return jsonify({"error": "No video file uploaded"}), 400
    
    video_file = request.files['video']
    video_path = f"uploads/{video_file.filename}"

    # Ensure upload folder exists
    os.makedirs("uploads", exist_ok=True)
    video_file.save(video_path)

    print("Uploading file...")

    # Upload the video to Gemini AI
    uploaded_video = genai.upload_file(path=video_path)

    # Wait for video processing
    while uploaded_video.state.name == "PROCESSING":
        print('.', end='', flush=True)
        time.sleep(10)
        uploaded_video = genai.get_file(uploaded_video.name)

    if uploaded_video.state.name == "FAILED":
        return jsonify({"error": "Video processing failed"}), 500

    # AI Prompt to extract player names
    prompt = "Give the full name of all the players in the video. Only list the full names, separated by commas."
    
    response = model.generate_content([uploaded_video, prompt], request_options={"timeout": 600})
    
    # Extract player names using regex
    players = extract_player_names(response.text)

    return jsonify({"players": players})
