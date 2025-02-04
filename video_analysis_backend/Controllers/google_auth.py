from datetime import timedelta
import json
import urllib.parse
from flask import jsonify, redirect, request
from google_auth_oauthlib.flow import Flow, InstalledAppFlow
from googleapiclient.discovery import build
import requests
from dotenv import load_dotenv
from Models.user_model import User
# import jwt
import re
load_dotenv()

redirect_url = "https://localhost:5000"
frontent_redirect_url = "http://localhost:5173"



SCOPES= [
    "https://www.googleapis.com/auth/drive.file", 
    "https://www.googleapis.com/auth/drive.photos.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly", 
    "https://www.googleapis.com/auth/userinfo.profile", 
    "https://www.googleapis.com/auth/spreadsheets", 
    "openid", 
    "https://www.googleapis.com/auth/drive.appdata", 
    "https://www.googleapis.com/auth/documents", 
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/userinfo.email",
]

REDIRECT_URI = f'{redirect_url}/callback'
OAUTH2_REDIRECT_URI = f'{redirect_url}/oauth2callback'

# Utility function to convert credentials to a dictionary
def credentials_to_dict(creds):
    return {
        'token': creds.token,
        'refresh_token': creds.refresh_token,
        'token_uri': creds.token_uri,
        'client_id': creds.client_id,
        'client_secret': creds.client_secret,
        'scopes': creds.scopes
    }


# Main login route
def gmail_login():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"message": "Please complete the sign-up process before proceeding"}), 400

    flow = Flow.from_client_secrets_file("Controllers/client_secret.json", scopes=SCOPES, redirect_uri=REDIRECT_URI)
    authorization_url, original_state = flow.authorization_url(
    access_type='offline', include_granted_scopes='true'
    )

    # Parse and update authorization URL
    url_parts = list(urllib.parse.urlparse(authorization_url))
    query = dict(urllib.parse.parse_qsl(url_parts[4]))

    query.update({'prompt': 'consent'})

    url_parts[4] = urllib.parse.urlencode(query)
    authorization_url = urllib.parse.urlunparse(url_parts)
    
    # Encode user_id and state into a single JSON string
    state_data = json.dumps({'state': original_state, 'user_id': user_id})
    encoded_state_data = urllib.parse.quote(state_data)

    modified_url = re.sub(r'(&|\?)state=[^&]*', '', authorization_url)
    modified_url += f'&state={encoded_state_data}' if '?' in modified_url else f'?state={encoded_state_data}'
    # authorization_url = build_authorization_url(flow, user_id)
    return redirect(modified_url)

# callback route
def gmail_callback():
    encoded_state_data = request.args.get('state')
    if not encoded_state_data:
        return 'State not found in query parameters', 400

    # Decode the state data
    state_data = json.loads(urllib.parse.unquote(encoded_state_data))
    user_id = state_data.get('user_id')
    state = request.args.get('state')

    if not state:
        return 'State not found in state data', 400

    flow = Flow.from_client_secrets_file(
        "Controllers/client_secret.json",
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )

    print("Authorization response URL:", request.url)
    flow.fetch_token(authorization_response=request.url)

    if state != request.args.get('state'):
        return 'State mismatch', 400

    credentials = flow.credentials
    new_credentials = credentials_to_dict(credentials)
    
    
    # Use the access token to get user info from the userinfo endpoint
    userinfo_endpoint = 'https://openidconnect.googleapis.com/v1/userinfo'
    headers = {
        'Authorization': f'Bearer {credentials.token}'
    }
    userinfo_response = requests.get(userinfo_endpoint, headers=headers)

    if userinfo_response.status_code != 200:
        return 'Failed to fetch user info', 500
    
    user_info = userinfo_response.json()
    email = user_info.get('email')
    new_credentials['email_id'] = user_info.get('email')

    # Add the expiration time to credentials
    ist_offset = timedelta(hours=5, minutes=30)

    # Add the expiration time to credentials
    ist_offset = timedelta(hours=5, minutes=30)

    new_credentials['expires_at'] = (
        (credentials.expiry + ist_offset).strftime("%Y-%m-%d, %H:%M:%S") if credentials.expiry else None
    )

    credentials_obj = User(credentials=new_credentials)
    
    user_data = credentials_obj.find_by_user_id(user_id)

    if user_data:
        credentials_obj.update_user_credentials(user_id, new_credentials)
        print("Data updated")

    # name = user_data.get('name')
    email_id = user_data.get('email_id')

    try:
        service = build('docs', 'v1', credentials=credentials)
    except Exception as serviceException:
        print(serviceException)

    # Generate JWT token and redirect with token
    # email_id = user_data.get('email_id')
    # jwt_token = jwt.encode(
    #     {'user_id': str(user_id), 'email': email_id, "is_authorize": True},
    #     'secret_key', algorithm='HS256'
    # )

    # Redirect URL with the JWT token
    verified_redirect_url = f"{frontent_redirect_url}?user_id={urllib.parse.quote(json.dumps(str(user_id)))}"

    return redirect(verified_redirect_url)
