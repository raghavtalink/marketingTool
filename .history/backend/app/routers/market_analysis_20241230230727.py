from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import MarketTrendAnalysis, DynamicPricing, BundleRecommendation
from ..auth import get_current_user
from ..database import db
from bson.objectid import ObjectId
from datetime import datetime

router = APIRouter(prefix="/market", tags=["market"])

@router.post("/trends")
async def analyze_trends(analysis: MarketTrendAnalysis, current_user: dict = Depends(get_current_user)):
    product = await db['products'].find_one({"_id": ObjectId(analysis.product_id)})
    
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
    
    response = ai.prompt(ai_prompt)
    return {"analysis": response['message']}

@router.post("/pricing")
async def suggest_pricing(pricing: DynamicPricing, current_user: dict = Depends(get_current_user)):
    product = await db['products'].find_one({"_id": ObjectId(pricing.product_id)})
    
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
    
    response = ai.prompt(ai_prompt)
    return {"pricing_strategy": response['message']}

@router.post("/bundles")
async def recommend_bundles(bundle: BundleRecommendation, current_user: dict = Depends(get_current_user)):
    products = await db['products'].find({"_id": {"$in": [ObjectId(pid) for pid in bundle.product_ids]}}).to_list(length=100)
    
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
    
    response = ai.prompt(ai_prompt)
    return {"bundle_recommendations": response['message']}