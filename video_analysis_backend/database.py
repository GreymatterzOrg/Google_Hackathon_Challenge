from pymongo import MongoClient
from dotenv import load_dotenv
from pymongo.collection import Collection
import os

load_dotenv()

MONGOURI = "mongodb://video_analysis_google:nSp4$aSVc3QS1@192.168.0.11:27017/video_analysis_google"

DBNAME = "video_analysis_google"

class Database:
    def __init__(self, db_name=DBNAME, uri=MONGOURI):
        self.client = MongoClient(uri)
        self.db = self.client[db_name]

    def get_database(self):
        return self.db

    def get_collection(self, name: str) -> Collection:
        return self.db.get_collection(name)

    def close_connection(self):
        self.client.close()

