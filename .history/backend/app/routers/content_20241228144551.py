from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import AIPrompt, AIResponse
from ..auth import get_current_user
from ..database import db
from bson.objectid import ObjectId
from meta_ai_api import MetaAI

router = APIRouter(
    prefix="/content",
    tags=["AI Content Generation"],
    dependencies=[Depends(get_current_user)]
)

ai = MetaAI()

@router.post("/generate", response_model=AIResponse)
async def generate_content(prompt: AIPrompt, current_user: dict = Depends(get_current_user)):
    # Fetch product details
    product = await db['products'].find_one({"_id": ObjectId(prompt.product_id), "user_id": str(current_user['_id'])})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Craft the prompt based on prompt_type
    if prompt.prompt_type == "title":
        ai_prompt = f"""
        You are an expert product marketer. Create a compelling and SEO-optimized title for the following product:

        Product Name: {product['name']}
        Category: {product.get('category', 'N/A')}
        Description: {product.get('description', 'N/A')}

        Ensure the title is under 200 characters and includes relevant keywords to enhance search visibility.
        """
    elif prompt.prompt_type == "description":
        ai_prompt = f"""
        You are a skilled copywriter specializing in e-commerce. Write a detailed and persuasive product description for the following product:

        Product Name: {product['name']}
        Category: {product.get('category', 'N/A')}
        Description: {product.get('description', 'N/A')}

        The description should be between 150-300 words, highlight the benefits, and include relevant keywords for SEO.
        """
    elif prompt.prompt_type == "seo":
        # Fetch competitor keywords if any
        competitors = await db['competitors'].find({"product_id": prompt.product_id}).to_list(length=100)
        competitor_keywords = ", ".join([comp.get('name', '') for comp in competitors])
        ai_prompt = f"""
        As a SEO expert, provide a list of high-performing keywords for the following product to improve its search engine ranking:

        Product Name: {product['name']}
        Category: {product.get('category', 'N/A')}
        Description: {product.get('description', 'N/A')}
        Competitor Keywords: {competitor_keywords}

        List at least 10 keywords with high relevance and search volume. Include long-tail keywords where applicable.
        """
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid prompt type"
        )
    
    try:
        response = ai.prompt(message=ai_prompt)
        # Store generated content in DB
        await db['generated_content'].insert_one({
            "product_id": prompt.product_id,
            "content_type": prompt.prompt_type,
            "content": response['message'],
            "generated_at": datetime.utcnow()
        })
        return AIResponse(**response)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
