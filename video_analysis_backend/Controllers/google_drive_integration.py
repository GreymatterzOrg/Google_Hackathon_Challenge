from datetime import datetime
import os
from googleapiclient.discovery import build
from flask import json, jsonify, request
from Models.user_model import User
from google.oauth2.credentials import Credentials
from werkzeug.utils import secure_filename
from googleapiclient.http import MediaFileUpload
from google.auth.transport.requests import Request
import os
from datetime import datetime
from flask import request
import tempfile
n8n_url = os.getenv('N8N_URL')


def create_drive_service(credentials):
    try:
        service = build('drive', 'v3', credentials=credentials)
        return service
    except Exception as e:
        print(f"An error occurred while creating the Drive service: {e}")
        return None

# List all folders in Google Drive
def list_drive_folders(service):
    try:
        query = "mimeType='application/vnd.google-apps.folder' and trashed=false"
        results = service.files().list(q=query, fields="files(id, name)").execute()
        folders = results.get('files', [])
        return folders
    except Exception as e:
        print(f"An error occurred while listing folders: {e}")
        return []

# Upload file to Google Drive
def upload_file_to_drive(service, file_path, mime_type, folder_id):
    try:
        file_metadata = {
            'name': os.path.basename(file_path),
            'parents': [folder_id] if folder_id else []
        }
        media = MediaFileUpload(file_path, mimetype=mime_type)
        file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        return file.get('id')
    except Exception as e:
        print(f"An error occurred while uploading the file: {e}")
        return None

# Save media to Google Drive
def save_media_in_drive():
    user_id = request.form.get('user_id')
    folder_id = request.form.get('folder_id')  # User-selected folder ID
    image_files = request.files.getlist('images')
    video_files = request.files.getlist('videos')

    if not user_id or not folder_id or (not image_files and not video_files):
        return jsonify({"success": False, "message": "User ID, folder ID, images, or videos not provided"}), 400

    # Fetch user credentials
    credentials_obj = User()
    user_data = credentials_obj.find_by_user_id(user_id)
    if not user_data or 'credentials' not in user_data:
        return jsonify({"success": False, "message": "Credentials not found for the given user ID"}), 404
    
    creds = user_data['credentials']
    credentials = Credentials.from_authorized_user_info(info=creds)
    
    drive_service = create_drive_service(credentials)
    if not drive_service:
        return jsonify({"success": False, "message": "Failed to create Google Drive service"}), 500

    uploaded_file_ids = []
    uploaded_files_info = []

    # Upload images
    for image in image_files:
        with tempfile.NamedTemporaryFile(delete=False) as temp_image_file:
            file_path = temp_image_file.name
            image.save(file_path)

            mime_type = 'image/jpeg' if image.filename.lower().endswith('.jpg') else 'image/png'
            file_id = upload_file_to_drive(drive_service, file_path, mime_type, folder_id)

            if file_id:
                uploaded_file_ids.append(file_id)
                uploaded_files_info.append({'file_id': file_id, 'file_name': image.filename, 'type': 'image'})

            temp_image_file.close()
            os.remove(file_path)

    # Upload videos
    for video in video_files:
        with tempfile.NamedTemporaryFile(delete=False) as temp_video_file:
            file_path = temp_video_file.name
            video.save(file_path)

            mime_type = 'video/mp4' if video.filename.lower().endswith('.mp4') else 'video/avi'
            file_id = upload_file_to_drive(drive_service, file_path, mime_type, folder_id)

            if file_id:
                uploaded_file_ids.append(file_id)
                uploaded_files_info.append({'file_id': file_id, 'file_name': video.filename, 'type': 'video'})

            temp_video_file.close()
            os.remove(file_path)

    if uploaded_file_ids:
        return jsonify({"success": True, "message": "Files uploaded successfully", "files": uploaded_files_info}), 200
    else:
        return jsonify({"success": False, "message": "Failed to upload files"}), 500

# Endpoint to list available folders
def get_drive_folders():
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({"success": False, "message": "User ID not provided"}), 400
    
    credentials_obj = User()
    user_data = credentials_obj.find_by_user_id(user_id)
    if not user_data or 'credentials' not in user_data:
        return jsonify({"success": False, "message": "Credentials not found for the given user ID"}), 404
    
    creds = user_data['credentials']
    credentials = Credentials.from_authorized_user_info(info=creds)
    
    drive_service = create_drive_service(credentials)
    if not drive_service:
        return jsonify({"success": False, "message": "Failed to create Google Drive service"}), 500
    
    folders = list_drive_folders(drive_service)
    return jsonify({"success": True, "folders": folders}), 200


def list_spreadsheets(credentials):
    try:
        drive_service = build('drive', 'v3', credentials=credentials)
        response = drive_service.files().list(
            q="mimeType='application/vnd.google-apps.spreadsheet'",
            fields="files(id, name)"
        ).execute()
        spreadsheets = [{"id": f["id"], "name": f["name"]} for f in response.get("files", [])]
        return jsonify({"spreadsheets": spreadsheets})
    except Exception as e:
        print(f"An error occurred while listing spreadsheets: {e}")
        return jsonify({"error": "Failed to list spreadsheets"}), 500


def list_sheets(credentials, spreadsheet_id):
    try:
        sheets_service = build('sheets', 'v4', credentials=credentials)
        spreadsheet = sheets_service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        sheet_names = [sheet["properties"]["title"] for sheet in spreadsheet["sheets"]]
        return jsonify({"sheets": sheet_names})
    except Exception as e:
        print(f"An error occurred while listing sheets: {e}")
        return jsonify({"error": "Failed to list sheets"}), 500

def write_to_sheet(credentials, spreadsheet_id, sheet_name, data):

    try:
        sheets_service = build('sheets', 'v4', credentials=credentials)

        # Flatten the data format
        values = []
        for entry in data:
            email = entry['email']
            urls = entry['url']
            if isinstance(urls, list):  # If `url` is a list, create multiple rows for each URL
                for url in urls:
                    values.append([email, url])
            else:  # If `url` is a single string, create one row
                values.append([email, urls])

        body = {
            'values': values
        }

        result = sheets_service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=f"{sheet_name}!A2",  # Assumes headings are in row 1
            valueInputOption="USER_ENTERED",
            insertDataOption="INSERT_ROWS",
            body=body
        ).execute()

        return jsonify({"status": "Data added successfully"})
    except Exception as e:
        print(f"An error occurred while writing to the sheet: {e}")
        return jsonify({"error": "Failed to write data"}), 500
    

def read_from_sheet(credentials, spreadsheet_id, sheet_name):
    try:
        sheets_service = build('sheets', 'v4', credentials=credentials)

        # Reading the data from the specified sheet and range
        result = sheets_service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=f"{sheet_name}!A2:Z"  # Assuming data starts from row 2 and goes to column Z
        ).execute()

        values = result.get('values', [])

        if not values:
            return jsonify({"message": "No data found in the sheet."})

        # You can process the data here as needed
        return jsonify({
            'status': True,
            'message': 'data retrieved successfully',
            'data': values
            }), 201

    except Exception as e:
        print(f"An error occurred while reading the sheet: {e}")
        return jsonify({"error": "Failed to read data from the sheet"}), 500
    

''' api flow'''
def list_spreadsheets_api():
    user_id = request.args.get('user_id')

    credentials_obj = User()
    user_data = credentials_obj.find_by_user_id(user_id)

    if not user_data or 'credentials' not in user_data:
        return 'Credentials not found for the given user ID', 404
    
    # Rebuild credentials from stored data
    creds = user_data['credentials']
    credentials = Credentials(
        token=creds['token'],
        refresh_token=creds['refresh_token'],
        token_uri=creds['token_uri'],
        client_id=creds['client_id'],
        client_secret=creds['client_secret'],
        scopes=creds['scopes']
    )
    return list_spreadsheets(credentials)

def list_sheets_api():
    user_id = request.args.get('user_id')
    spreadsheet_id = request.args.get('spreadsheet_id')

    credentials_obj = User()

    user_data = credentials_obj.find_by_user_id(user_id)

    if not user_data or 'credentials' not in user_data:
        return 'Credentials not found for the given user ID', 404
    
    # Rebuild credentials from stored data
    creds = user_data['credentials']
    credentials = Credentials(
        token=creds['token'],
        refresh_token=creds['refresh_token'],
        token_uri=creds['token_uri'],
        client_id=creds['client_id'],
        client_secret=creds['client_secret'],
        scopes=creds['scopes']
    )    
    
    return list_sheets(credentials, spreadsheet_id)

def write_to_sheet_api():
    user_id = request.json.get('user_id')
    spreadsheet_id = request.json.get('spreadsheet_id')
    sheet_name = request.json.get('sheet_name')
    data = request.json.get('data')  # Expected to be a list of URLs and email IDs
    automation_type = request.json.get('automation_type')

    # Field verification
    if not user_id:
        return jsonify({"error": "'user_id' is required."}), 400
    if not spreadsheet_id:
        return jsonify({"error": "'spreadsheet_id' is required."}), 400
    if not sheet_name:
        return jsonify({"error": "'sheet_name' is required."}), 400
    if data is None:
        return jsonify({"error": "'data' is required."}), 400
    if not automation_type:
        return jsonify({"error": "'automation_type' is required."}), 400

    credentials_obj = User()

    user_data = credentials_obj.find_by_user_id(user_id)

    if not user_data or 'credentials' not in user_data:
        return 'Credentials not found for the given user ID', 404
    
    # Rebuild credentials from stored data
    creds = user_data['credentials']
    credentials = Credentials(
        token=creds['token'],
        refresh_token=creds['refresh_token'],
        token_uri=creds['token_uri'],
        client_id=creds['client_id'],
        client_secret=creds['client_secret'],
        scopes=creds['scopes']
    )    

    if automation_type=='reddit':
        return write_to_sheet_reddit(credentials, spreadsheet_id, sheet_name, data)
    
    if automation_type=='linkedin':
        return write_to_sheet_linkedin(credentials, spreadsheet_id, sheet_name, data)

    return write_to_sheet_linkedin(credentials, spreadsheet_id, sheet_name, data)


def read_sheet_api():
    user_id = request.args.get('user_id')
    spreadsheet_id = request.args.get('spreadsheet_id')
    sheet_name = request.args.get('sheet_name')

    credentials_obj = User()
    user_data = credentials_obj.find_by_user_id(user_id)

    if not user_data or 'credentials' not in user_data:
        return 'Credentials not found for the given user ID', 404
    
    # Rebuild credentials from stored data
    creds = user_data['credentials']
    credentials = Credentials(
        token=creds['token'],
        refresh_token=creds['refresh_token'],
        token_uri=creds['token_uri'],
        client_id=creds['client_id'],
        client_secret=creds['client_secret'],
        scopes=creds['scopes']
    )

    # Call the function to read the sheet data
    return read_from_sheet(credentials, spreadsheet_id, sheet_name)
