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

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    inventory_count: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    _id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str
        }

# AI Content Generation Schemas
class AIPrompt(BaseModel):
    product_id: str
    prompt_type: str  # 'title', 'description', or 'seo'

class AIResponse(BaseModel):
    content: str
    content_type: str
    product_id: str
    generated_at: Optional[datetime] = None

    class Config:
        orm_mode = True