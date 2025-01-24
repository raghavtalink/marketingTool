from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from bson import ObjectId
from datetime import datetime


# User Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str = Field(alias="_id")
    username: str
    email: EmailStr

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str
        }

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

# Product Schemas
class ProductCreate(BaseModel):
    name: str
    description: Optional[str]
    category: Optional[str]
    price: Optional[float]
    inventory_count: Optional[int]

class ProductOut(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    name: str
    description: Optional[str]
    category: Optional[str]
    price: Optional[float]
    inventory_count: Optional[int]
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str
        }

# AI Content Generation Schemas
class AIPrompt(BaseModel):
    product_id: str
    prompt_type: str  # e.g., 'title', 'description', 'seo', etc.

class AIResponse(BaseModel):
    message: str
    sources: List[dict]
    media: Optional[List[dict]] = []
