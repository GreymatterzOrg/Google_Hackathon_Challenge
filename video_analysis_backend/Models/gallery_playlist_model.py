from datetime import datetime
from database import Database
from pymongo.collection import Collection
from bson.objectid import ObjectId

db = Database()

class GalleryPlaylist:
    collection: Collection = db.get_collection('galleryPlaylist')


    def __init__(self, user_id, file_id='', original_path='', clips_paths=[], screenshot_paths=[], playlist=''):
        self.user_id=ObjectId(user_id) if user_id else ''
        self.file_id=file_id
        self.clips_paths=clips_paths
        self.playlist=playlist
        self.original_path=original_path
        self.screenshot_paths=screenshot_paths
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        galler_playlist_dict = self.__dict__
        result = self.collection.insert_one(galler_playlist_dict)
        return result.inserted_id

    @staticmethod
    def find(query):
        return GalleryPlaylist.collection.find(query)

    @staticmethod
    def update(query, update_values):
        return GalleryPlaylist.collection.update_one(query, {'$set': update_values})

    @staticmethod
    def delete(query):
        return GalleryPlaylist.collection.delete_one(query)

    @staticmethod
    def find_one(query):
        return GalleryPlaylist.collection.find_one(query, {'_id':0})


    @staticmethod
    def update_one(filter_query, update_query):
        try:
            result = GalleryPlaylist.collection.update_one(filter_query, update_query)
            return result.modified_count > 0
        except Exception as e:
            print(f"An error occurred: {e}")
            return False