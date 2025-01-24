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
        
        ai_prompt = f"""
        You are a market research expert with access to real-time market data. Analyze the current market trends for:

        Product: {product['name']}
        Category: {product.get('category', 'N/A')}
        Price Range: {product.get('price', 'N/A')} {product.get('currency', 'USD')}
        Timeframe: {analysis.timeframe}

        Please provide:
        1. Current market position
        2. Emerging trends in this category
        3. Consumer behavior patterns
        4. Market size and growth potential
        5. Key market drivers
        6. Risk factors
        7. Opportunities for growth

        Base your analysis on current market data and trends.
        """
        
        try:
            response = ai.prompt(ai_prompt)
            
            # Store analysis in database
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
        
        ai_prompt = f"""
        You are a pricing strategy expert. Based on the following data, suggest optimal pricing:

        Product: {product['name']}
        Current Price: {product.get('price', 'N/A')} {product.get('currency', 'USD')}
        Target Margin: {pricing.target_margin}%
        Competitor Prices: {', '.join(map(str, pricing.competitor_prices))}
        Market Demand: {pricing.market_demand}
        Season: {pricing.season}

        Provide:
        1. Recommended price range
        2. Price elasticity analysis
        3. Seasonal pricing strategy
        4. Competitive positioning
        5. Risk assessment
        """
        
        try:
            response = ai.prompt(ai_prompt)
            
            # Store pricing analysis in database
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
        # Verify all products belong to the user
        products = await db['products'].find({
            "_id": {"$in": [ObjectId(pid) for pid in bundle.product_ids]},
            "user_id": str(current_user['_id'])
        }).to_list(length=100)
        
        if len(products) != len(bundle.product_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more products not found or not owned by user"
            )
        
        ai_prompt = f"""
        You are a product bundling strategist. Analyze these products and suggest optimal bundles:

        Products:
        {'\n'.join([f"- {p['name']}: {p.get('price', 'N/A')} {p.get('currency', 'USD')}" for p in products])}

        Target Audience: {bundle.target_audience}
        Price Range: {bundle.price_range}
        Season: {bundle.season}

        Provide:
        1. Recommended bundle combinations
        2. Bundle pricing strategy
        3. Expected synergy effects
        4. Marketing angles
        5. Success probability
        6. Target demographic analysis
        """
        
        try:
            response = ai.prompt(ai_prompt)
            
            # Store bundle recommendations in database
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

# Add a route to get analysis history
@router.get("/history/{analysis_type}")
async def get_analysis_history(analysis_type: str, current_user: dict = Depends(get_current_user)):
    try:
        history = await db['market_analysis'].find({
            "user_id": str(current_user['_id']),
            "analysis_type": analysis_type
        }).sort("generated_at", -1).to_list(length=10)
        
        # Convert ObjectId to string for JSON serialization
        for item in history:
            item['_id'] = str(item['_id'])
        
        return history
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analysis history: {str(e)}"
        )