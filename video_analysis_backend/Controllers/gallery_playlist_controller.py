from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from Models.gallery_playlist_model import GalleryPlaylist  
from Utils.common_utils import serialize_object

# create a playlist
def create_playlist():
    """
    Create a new gallery playlist
    """
    data = request.json
    user_id = data.get('user_id')
    file_id = data.get('file_id')
    clips_paths = data.get('clips_paths')
    screenshot_paths = data.get('screenshot_paths')
    playlist_name = data.get('playlist')
    original_path = data.get('original_path')

    if not user_id or not playlist_name:
        return jsonify({'error': 'user_id and playlist are required'}), 400

    try:
        new_playlist = GalleryPlaylist(user_id=user_id, file_id=file_id, playlist=playlist_name,clips_paths=clips_paths, screenshot_paths=screenshot_paths,original_path=original_path)
        playlist_id = new_playlist.save()
        return jsonify({'status':True,'message': 'Playlist created successfully', 'data': str(playlist_id)}), 201
    except Exception as e:
        return jsonify({'status':False, 'message': f'Failed to create playlist: {str(e)}'}), 500

# get playlists based on user 
def get_all_playlists(user_id):
    """
    Get all playlists for a specific user
    """
    try:
        playlists = list(GalleryPlaylist.find({'user_id': ObjectId(user_id)}))
        for playlist in playlists:
            playlist['_id'] = str(playlist['_id'])
        return jsonify({'status':True, 'data': serialize_object(playlists)}), 200
    except Exception as e:
        return jsonify({'status':False, 'message': f'Failed to fetch playlists: {str(e)}'}), 500

# get particular playlist details 
def get_playlist(playlist_id):
    """
    Get a specific playlist by its ID
    """
    try:
        playlist = GalleryPlaylist.find_one({'_id': ObjectId(playlist_id)})
        if not playlist:
            return jsonify({'status':False,'message': 'Playlist not found'}), 404
        return jsonify({'status':True,'data': serialize_object(playlist)}), 200
    except Exception as e:
        return jsonify({'status':False,'message': f'Failed to fetch playlist: {str(e)}'}), 500

# delete playlist 
def delete_playlist(playlist_id):
    """
    Delete a playlist by its ID
    """
    try:
        result = GalleryPlaylist.delete({'_id': ObjectId(playlist_id)})
        if result.deleted_count == 0:
            return jsonify({'status':False, 'message': 'Playlist not found or already deleted'}), 404
        return jsonify({'status':True, 'message': 'Playlist deleted successfully'}), 200
    except Exception as e:
        return jsonify({'status':False, 'message': f'Failed to delete playlist: {str(e)}'}), 500
