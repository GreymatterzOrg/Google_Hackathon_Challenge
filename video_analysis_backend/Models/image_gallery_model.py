from datetime import datetime
from database import Database
from pymongo.collection import Collection
from bson.objectid import ObjectId



db = Database()

class ImageGallery:
    collection: Collection = db.get_collection('imageGallery')


    def __init__(self, user_id, file_id, screenshots=[], clips=[]):
        self.file_id=file_id
        self.user_id=ObjectId(user_id) if user_id else ''
        self.screenshots=screenshots
        self.clips=clips
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        user_dict = self.__dict__
        result = self.collection.insert_one(user_dict)
        return result.inserted_id

    @staticmethod
    def find(query):
        return ImageGallery.collection.find(query)

    @staticmethod
    def update(query, update_values):
        return ImageGallery.collection.update_one(query, {'$set': update_values})

    @staticmethod
    def delete(query):
        return ImageGallery.collection.delete_one(query)

    @staticmethod
    def find_one(query):
        return ImageGallery.collection.find_one(query, {'_id':0})


    @staticmethod
    def update_one(filter_query, update_query):
        try:
            print(filter_query,'----------------------',update_query,'++++++++++++++++++++++++++++++++++')
            result = ImageGallery.collection.update_one(filter_query, update_query)
            return result.modified_count > 0
        except Exception as e:
            print(f"An error occurred: {e}")
            return False