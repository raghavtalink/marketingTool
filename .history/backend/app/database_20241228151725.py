from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

# Get MongoDB URI from environment variable
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/product_marketing_tool")

# Create MongoDB client
client = AsyncIOMotorClient(MONGODB_URI)
db = client.get_default_database()

# Utility function to convert ObjectId to string
def object_id_str(obj_id):
    return str(obj_id)
