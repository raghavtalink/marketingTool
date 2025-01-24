from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = Field(alias="_id")
    username: str
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Product(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: str
    name: str
    description: Optional[str]
    category: Optional[str]
    price: Optional[float]
    inventory_count: Optional[int]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Competitor(BaseModel):
    id: Optional[str] = Field(alias="_id")
    product_id: str
    name: Optional[str]
    listing_url: Optional[str]
    price: Optional[float]
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GeneratedContent(BaseModel):
    id: Optional[str] = Field(alias="_id")
    product_id: str
    content_type: str  # e.g., 'title', 'description', 'seo'
    content: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class SEOKkeyword(BaseModel):
    id: Optional[str] = Field(alias="_id")
    product_id: str
    keyword: str
    relevance_score: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
