from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

# Get MongoDB URI from environment variable
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://raghavkundra:admin1234@cluster0.hsfad.mongodb.net/product_marketing_tool?retryWrites=true&w=majority&appName=Cluster0")

# Create MongoDB client
client = AsyncIOMotorClient(MONGODB_URI)
db = client['product_marketing_tool']  # Explicitly specify the database name

# Utility function to convert ObjectId to string
def object_id_str(obj_id):
    return str(obj_id)
