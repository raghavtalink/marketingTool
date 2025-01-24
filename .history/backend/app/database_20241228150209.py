from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

# Get MongoDB credentials from environment variables
MONGODB_USER = os.getenv("MONGODB_USER")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
MONGODB_HOST = os.getenv("MONGODB_HOST", "localhost")
MONGODB_PORT = os.getenv("MONGODB_PORT", "27017")
MONGODB_DB = os.getenv("MONGODB_DB", "product_marketing_tool")

# URL encode the username and password
encoded_username = quote_plus(MONGODB_USER) if MONGODB_USER else ""
encoded_password = quote_plus(MONGODB_PASSWORD) if MONGODB_PASSWORD else ""

# Construct the MongoDB URI
if MONGODB_USER and MONGODB_PASSWORD:
    MONGODB_URI = f"mongodb://{encoded_username}:{encoded_password}@{MONGODB_HOST}:{MONGODB_PORT}"
else:
    MONGODB_URI = f"mongodb://{MONGODB_HOST}:{MONGODB_PORT}"

# Create MongoDB client
client = AsyncIOMotorClient(MONGODB_URI)
db = client[MONGODB_DB]

# Utility function to convert ObjectId to string
def object_id_str(obj_id):
    return str(obj_id)
