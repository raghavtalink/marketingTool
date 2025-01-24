from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import SocialMediaCampaign
from ..auth import get_current_user
from ..database import db
from bson.objectid import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from meta_ai_api import MetaAI

router = APIRouter(
    prefix="/social-media",
    tags=["Social Media Campaigns"],
    dependencies=[Depends(get_current_user)]
)

# Initialize AI client
ai = MetaAI()

@router.post("/create", response_model=SocialMediaCampaign)
async def create_campaign(campaign: SocialMediaCampaign, current_user: dict = Depends(get_current_user)):
    try:
        # Validate product ownership
        product = await db['products'].find_one({
            "_id": ObjectId(campaign.product_id),
            "user_id": str(current_user['_id'])
        })
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Construct AI prompt
        ai_prompt = f"""
        You are a social media strategist. Based on the following product details, design a comprehensive social media campaign.

        Product Name: {product['name']}
        Category: {product.get('category', 'N/A')}
        Description: {product.get('description', 'N/A')}
        Price: {product.get('price', 'N/A')} {product.get('currency', 'USD')}
        Campaign Name: {campaign.campaign_name}
        Campaign Objectives: {', '.join(campaign.objectives)}
        Platforms: {', '.join(campaign.platforms)}

        Provide a detailed content plan that includes post ideas, captions, hashtags, and scheduling suggestions.
        """

        # Generate campaign content using MetaAI
        campaign_content = ai.prompt(ai_prompt)

        # Save campaign to the database
        campaign_content_dict = campaign.dict()
        campaign_content_dict['content_plan'] = campaign_content
        campaign_content_dict['created_at'] = datetime.utcnow()
        campaign_content_dict['user_id'] = str(current_user['_id'])

        result = await db['social_media_campaigns'].insert_one(campaign_content_dict)
        created_campaign = await db['social_media_campaigns'].find_one({"_id": result.inserted_id})

        created_campaign['_id'] = str(created_campaign['_id'])

        return created_campaign

    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )

@router.get("/list")
async def list_campaigns(current_user: dict = Depends(get_current_user)):
    try:
        campaigns = await db['social_media_campaigns'].find(
            {"user_id": str(current_user['_id'])}
        ).to_list(length=100)
        
        # Convert ObjectId to string for JSON serialization
        for campaign in campaigns:
            campaign['_id'] = str(campaign['_id'])
        
        return campaigns
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch campaigns: {str(e)}"
        )