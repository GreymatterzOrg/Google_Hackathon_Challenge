from datetime import datetime
from database import Database
from pymongo.collection import Collection
from werkzeug.security import generate_password_hash
from bson.objectid import ObjectId

db = Database()

class User:
    collection: Collection = db.get_collection('users')

    def __init__(self, name='', email_id='', image='', password='', otp='', is_verified=False, method='',credentials=''):
        self.name = name
        self.email_id = email_id
        self.image = image or ''
        self.password= generate_password_hash(password) if password else ''  
        self.otp = otp
        self.is_verified = is_verified
        self.method=method if method else 'Email'
        self.credentials = credentials 
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        user_dict = self.__dict__
        result = self.collection.insert_one(user_dict)
        return result.inserted_id

    @staticmethod
    def find(query):
        return User.collection.find(query)

    @staticmethod
    def find_one(query):
        return User.collection.find_one(query)

    @staticmethod
    def update(query, update_values):
        update_values['updated_at'] = datetime.utcnow()
        return User.collection.update_one(query, {'$set': update_values})

    @staticmethod
    def find_by_email(email_id):
        return User.collection.find_one({"email_id": email_id})

    @staticmethod
    def find_by_user_id(user_id):
        return User.collection.find_one({"_id": ObjectId(user_id)},{"password": 0,"created_at":0,"updated_at":0})

    @staticmethod
    def update_otp(phone_number, otp):
        return User.update({"phone_number": phone_number}, {"otp": otp})
    
    @staticmethod
    def delete(query):
        return User.collection.delete_one(query)

    @staticmethod
    def update_user_credentials(user_id, new_credentials):
        update_data = {
            'is_authorize': True,
            'credentials': new_credentials,
            'updated_at': datetime.utcnow()
        }
        return User.collection.update_one({'_id': ObjectId(user_id)}, {'$set': update_data})
    
    @staticmethod
    def update_user_credentials_new(user_id):
        update_data = {
            'is_authorize': False,
            'credentials': '',
            'updated_at': datetime.utcnow()
        }
        return User.collection.update_one({'_id': ObjectId(user_id)}, {'$set': update_data})