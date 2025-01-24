from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import MarketTrendAnalysis, DynamicPricing, BundleRecommendation
from ..auth import get_current_user
from ..database import db
from bson.objectid import ObjectId
from bson.errors import InvalidId
from meta_ai_api import MetaAI
from datetime import datetime
from typing import List

router = APIRouter(prefix="/market", tags=["market"])

# Initialize Meta AI
ai = MetaAI()

@router.post("/trends")
async def analyze_trends(analysis: MarketTrendAnalysis, current_user: dict = Depends(get_current_user)):
    try:
        product = await db['products'].find_one({
            "_id": ObjectId(analysis.product_id),
            "user_id": str(current_user['_id'])
        })
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        ai_prompt = (
            "You are a market research expert with real-time internet access. "
            "Using current online market data, trends, and news sources, provide a comprehensive analysis.\n\n"
            f"Product: {product['name']}\n"
            f"Category: {product.get('category', 'N/A')}\n"
            f"Price Range: {product.get('price', 'N/A')} {product.get('currency', 'USD')}\n"
            f"Timeframe: {analysis.timeframe}\n\n"
            "Using real-time internet data, analyze and provide:\n"
            "1. Current market position and recent market changes\n"
            "2. Latest emerging trends (from the past 3 months)\n"
            "3. Recent consumer behavior shifts\n"
            "4. Updated market size data and growth forecasts\n"
            "5. Current market drivers and economic factors\n"
            "6. New market risks and challenges\n"
            "7. Fresh opportunities based on current data\n\n"
            "Important: Base your analysis on current online data and recent market developments. "
            "Include relevant statistics and data points from reliable sources."
        )
        
        try:
            response = ai.prompt(ai_prompt)
            
            analysis_doc = {
                "product_id": analysis.product_id,
                "user_id": str(current_user['_id']),
                "analysis_type": "market_trends",
                "content": response['message'],
                "generated_at": datetime.utcnow()
            }
            await db['market_analysis'].insert_one(analysis_doc)
            
            return {"analysis": response['message']}
            
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
        
        ai_prompt = (
            "You are a pricing strategy expert with access to current market data. "
            "Using real-time internet data and market intelligence, provide a detailed pricing analysis.\n\n"
            f"Product: {product['name']}\n"
            f"Current Price: {product.get('price', 'N/A')} {product.get('currency', 'USD')}\n"
            f"Category: {product.get('category', 'N/A')}\n"
            f"Target Margin: {pricing.target_margin}%\n"
            f"Competitor Prices: {', '.join(map(str, pricing.competitor_prices))}\n"
            f"Market Demand: {pricing.market_demand}\n"
            f"Season: {pricing.season}\n\n"
            "Using current market data, provide:\n"
            "1. Optimal price range based on real-time market conditions\n"
            "2. Current market price trends and forecasts\n"
            "3. Recent pricing strategies of major competitors\n"
            "4. Price elasticity analysis using current market data\n"
            "5. Seasonal pricing recommendations with timing\n"
            "6. Risk assessment based on current market conditions\n"
            "7. Promotional pricing opportunities\n\n"
            "Important: Include current market data, competitor moves, and industry benchmarks "
            "from reliable online sources to support your recommendations."
        )
        
        try:
            response = ai.prompt(ai_prompt)
            
            pricing_doc = {
                "product_id": pricing.product_id,
                "user_id": str(current_user['_id']),
                "analysis_type": "pricing_strategy",
                "content": response['message'],
                "target_margin": pricing.target_margin,
                "market_demand": pricing.market_demand,
                "season": pricing.season,
                "generated_at": datetime.utcnow()
            }
            await db['market_analysis'].insert_one(pricing_doc)
            
            return {"pricing_strategy": response['message']}
            
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

@router.post("/bundles")
async def recommend_bundles(bundle: BundleRecommendation, current_user: dict = Depends(get_current_user)):
    try:
        products = await db['products'].find({
            "_id": {"$in": [ObjectId(pid) for pid in bundle.product_ids]},
            "user_id": str(current_user['_id'])
        }).to_list(length=100)
        
        if len(products) != len(bundle.product_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more products not found or not owned by user"
            )
        
        # Format product list with proper string handling
        product_list = "\n".join([
            f"- {p.get('name', 'N/A')}: {p.get('price', 'N/A')} {p.get('currency', 'USD')}"
            for p in products
        ])
        
        ai_prompt = (
            "You are a product bundling strategist with access to current market data. "
            "Using real-time internet data and consumer trends, analyze and recommend optimal bundles.\n\n"
            "Products to analyze:\n"
            f"{product_list}\n\n"
            f"Target Audience: {bundle.target_audience}\n"
            f"Price Range: {bundle.price_range}\n"
            f"Season: {bundle.season}\n\n"
            "Using current market data, provide:\n"
            "1. Recommended bundle combinations based on current trends\n"
            "2. Bundle pricing strategy using market benchmarks\n"
            "3. Current market synergy opportunities\n"
            "4. Trending marketing angles and themes\n"
            "5. Success probability based on current market data\n"
            "6. Target demographic insights from recent studies\n"
            "7. Seasonal timing recommendations\n"
            "8. Competitive bundle analysis\n\n"
            "Important: Base recommendations on current market trends, consumer behavior data, "
            "and successful bundle examples from the market. Include relevant statistics and benchmarks."
        )
        
        try:
            response = ai.prompt(ai_prompt)
            
            bundle_doc = {
                "product_ids": bundle.product_ids,
                "user_id": str(current_user['_id']),
                "analysis_type": "bundle_recommendation",
                "content": response['message'],
                "target_audience": bundle.target_audience,
                "price_range": bundle.price_range,
                "season": bundle.season,
                "generated_at": datetime.utcnow()
            }
            await db['market_analysis'].insert_one(bundle_doc)
            
            return {"bundle_recommendations": response['message']}
            
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