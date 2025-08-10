from pymongo import MongoClient

MONGODB_URI = 'mongodb://localhost:27017/'
DATABASE_NAME = 'SH13'

def get_database():
    """
    获取MongoDB数据库连接
    """
    client = MongoClient(MONGODB_URI)
    return client[DATABASE_NAME]
