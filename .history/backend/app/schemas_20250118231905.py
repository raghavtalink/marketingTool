from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from bson import ObjectId
from datetime import datetime
from enum import Enum


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
    currency: Optional[str] = 'USD'

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
        if v not in allowed_types:
            raise ValueError(f'prompt_type must be one of: {", ".join(allowed_types)}')
        return v

    @validator('sentiment')
    def validate_sentiment(cls, v):
        allowed_sentiments = ['positive', 'neutral', 'negative']
        if v and v not in allowed_sentiments:
            raise ValueError(f'sentiment must be one of: {", ".join(allowed_sentiments)}')
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

class SocialMediaCampaign(BaseModel):
    product_id: str
    campaign_name: str
    platforms: List[str]  # e.g., ['Facebook', 'Instagram', 'Twitter']
    objectives: List[str]  # e.g., ['Brand Awareness', 'Engagement']
    content_plan: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        orm_mode = True

class MarketDemand(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"

class Season(str, Enum):
    CURRENT = "current"
    SPRING = "spring"
    SUMMER = "summer"
    FALL = "fall"
    WINTER = "winter"

class PriceRange(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    PREMIUM = "premium"

class TimeFrame(str, Enum):
    CURRENT = "current"
    THREE_MONTHS = "3_months"
    SIX_MONTHS = "6_months"
    ONE_YEAR = "1_year"

class MarketTrendAnalysis(BaseModel):
    product_id: str
    timeframe: TimeFrame = Field(
        default=TimeFrame.CURRENT,
        description="Time period for trend analysis"
    )
    trend_type: Optional[str] = Field(
        default="market_position",
        description="Type of trend analysis to perform"
    )

class CompetitorData(BaseModel):
    name: str = Field(..., description="Competitor company or product name")
    price: float = Field(..., description="Current market price")
    currency: str = Field(default="USD", description="Currency of the price")
    url: Optional[str] = Field(None, description="Product URL if available")
    features: Optional[List[str]] = Field(
        default_factory=list,
        description="Key product features"
    )

class DynamicPricing(BaseModel):
    product_id: str
    target_margin: float = Field(
        ...,
        description="Target profit margin percentage",
        ge=0,
        le=100
    )
    competitor_prices: List[float] = Field(
        default_factory=list,
        description="Known competitor prices"
    )
    market_demand: MarketDemand = Field(
        ...,
        description="Current market demand level"
    )
    season: Season = Field(
        ...,
        description="Target season for pricing"
    )

    @validator('competitor_prices')
    def validate_competitor_prices(cls, v):
        if any(price < 0 for price in v):
            raise ValueError("Competitor prices cannot be negative")
        return v

class BundleRecommendation(BaseModel):
    product_ids: List[str] = Field(
        ...,
        description="List of product IDs to analyze for bundling",
        min_items=2
    )
    target_audience: str = Field(
        ...,
        description="Target demographic for the bundle"
    )
    price_range: PriceRange = Field(
        ...,
        description="Target price range for the bundle"
    )
    season: Season = Field(
        ...,
        description="Target season for the bundle"
    )

class AnalysisResponse(BaseModel):
    analysis: str
    generated_at: datetime
    analysis_type: str

class PricingResponse(BaseModel):
    pricing_strategy: str
    competitors: List[CompetitorData]
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class BundleResponse(BaseModel):
    bundle_recommendations: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class HistoryItem(BaseModel):
    id: str = Field(alias="_id")
    product_id: Optional[str]
    product_ids: Optional[List[str]]
    user_id: str
    analysis_type: str
    content: str
    generated_at: datetime
    competitors: Optional[List[CompetitorData]]
    target_margin: Optional[float]
    market_demand: Optional[str]
    season: Optional[str]
    target_audience: Optional[str]
    price_range: Optional[str]

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }  

class ImageGenerationPrompt(BaseModel):
    prompt: str
    steps: Optional[int] = 4
class BackgroundRemovalRequest(BaseModel):
    product_id: str

class ImageEditorProject(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: str
    product_id: str
    background_image: Optional[str]  # Base64 encoded
    product_image: Optional[str]     # Base64 encoded
    edited_image: Optional[str]      # Base64 encoded
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str
        }