import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('backend/.env')
uri = os.environ.get('MONGODB_URI')
print(f"Testing URI: {uri}")

try:
    client = MongoClient(uri)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("General connection successful!")
    
    # Try an authenticated command
    client.inventory_db.command('ping')
    print("Authentication successful!")
except Exception as e:
    print(f"Connection failed: {e}")
