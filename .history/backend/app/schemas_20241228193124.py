from pydantic import BaseModel, EmailStr, Field, validator
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
    competitor_urls: Optional[List[str]] = []

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str
        }

# AI Content Generation Schemas
class AIPrompt(BaseModel):
    product_id: str
    prompt_type: str
    sentiment: Optional[str] = 'neutral'

    @validator('prompt_type')
    def validate_prompt_type(cls, v):
        allowed_types = ['title', 'description', 'seo', 'full_listing']
        allowed_types = ['title', 'description', 'seo']
        if v not in allowed_types:
            raise ValueError(f'prompt_type must be one of: {", ".join(allowed_types)}')
        return v

class AIResponse(BaseModel):
    content: str
    content_type: str
    product_id: str
    generated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class ChatMessage(BaseModel):
    message: str
    sender: str  # 'user' or 'bot'
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatHistory(BaseModel):
    product_id: str
    messages: List[ChatMessage] = []