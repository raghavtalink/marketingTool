from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import DynamicPricing, CompetitorData
from ..auth import get_current_user
from ..database import db
from bson.objectid import ObjectId
from bson.errors import InvalidId
from meta_ai_api import MetaAI
import json
import logging

router = APIRouter(prefix="/market", tags=["market"])
logger = logging.getLogger(__name__)
ai = MetaAI()

async def find_competitors(product: dict, ai: MetaAI) -> List[CompetitorData]:
    search_prompt = (
        "Using real-time internet data, find major competitors and their prices for:\n\n"
        f"Product: {product['name']}\n"
        f"Category: {product.get('category', 'N/A')}\n"
        f"Price Range: {product.get('price', 'N/A')} {product.get('currency', 'USD')}\n\n"
        "Please provide:\n"
        "1. Top 5 direct competitors selling similar products\n"
        "2. Their current market prices\n"
        "3. Key product features comparison\n"
        "Format the response as a JSON array with objects containing: "
        "{name, price, url, features}"
    )
    
    try:
        response = ai.prompt(search_prompt)
        competitor_data = json.loads(response['message'])
        return [CompetitorData(**comp) for comp in competitor_data]
    except Exception as e:
        logger.error(f"Failed to fetch competitor data: {str(e)}")
        return []

@router.post("/pricing")
async def suggest_pricing(pricing: DynamicPricing, current_user: dict = Depends(get_current_user)):
    try:
        product = await db['products'].find_one({
            "_id": ObjectId(pricing.product_id),
            "user_id": str(current_user['_id'])
        })
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Get competitor data
        competitors = await find_competitors(product, ai)
        
        # Combine found competitor prices with provided ones
        all_competitor_prices = [comp.price for comp in competitors] + pricing.competitor_prices
        
        ai_prompt = (
            "You are a pricing strategy expert with access to current market data. "
            "Using real-time internet data and market intelligence, provide a detailed pricing analysis.\n\n"
            f"Product: {product['name']}\n"
            f"Current Price: {product.get('price', 'N/A')} {product.get('currency', 'USD')}\n"
            f"Category: {product.get('category', 'N/A')}\n"
            f"Target Margin: {pricing.target_margin}%\n"
            f"Found Competitor Prices: {', '.join(map(str, all_competitor_prices))}\n"
            f"Market Demand: {pricing.market_demand}\n"
            f"Season: {pricing.season}\n\n"
            "Competitor Analysis:\n"
            f"{json.dumps([comp.dict() for comp in competitors], indent=2)}\n\n"
            "Using this data, provide:\n"
            "1. Optimal price range based on competitor analysis\n"
            "2. Current market price trends and forecasts\n"
            "3. Detailed competitor pricing strategies\n"
            "4. Price elasticity analysis\n"
            "5. Seasonal pricing recommendations\n"
            "6. Risk assessment\n"
            "7. Promotional pricing opportunities"
        )
        
        try:
            response = ai.prompt(ai_prompt)
            
            analysis_doc = {
                "product_id": pricing.product_id,
                "user_id": str(current_user['_id']),
                "analysis_type": "pricing_strategy",
                "content": response['message'],
                "competitors": [comp.dict() for comp in competitors],
                "target_margin": pricing.target_margin,
                "market_demand": pricing.market_demand,
                "season": pricing.season,
                "generated_at": datetime.utcnow()
            }
            await db['market_analysis'].insert_one(analysis_doc)
            
            return {
                "pricing_strategy": response['message'],
                "competitors": competitors
            }
            
        except Exception as ai_error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI generation error: {str(ai_error)}"
            )
    
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format"
        )