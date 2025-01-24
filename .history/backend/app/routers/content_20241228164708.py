from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import AIPrompt, AIResponse
from ..auth import get_current_user
from ..database import db
from bson.objectid import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from typing import List

router = APIRouter(
    prefix="/content",
    tags=["AI Content Generation"],
    dependencies=[Depends(get_current_user)]
)

@router.post("/generate", response_model=AIResponse)
async def generate_content(prompt: AIPrompt, current_user: dict = Depends(get_current_user)):
    try:
        # Validate ObjectId before querying
        object_id = ObjectId(prompt.product_id)
        product = await db['products'].find_one({
            "_id": object_id,
            "user_id": str(current_user['_id'])
        })
        
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
        elif prompt.prompt_type == "features":
            ai_prompt = f"""
            You are a product specialist. List the key features and benefits of the following product in a clear, bullet-point format:

            Product Name: {product['name']}
            Category: {product.get('category', 'N/A')}
            Description: {product.get('description', 'N/A')}

            Focus on the unique selling points and value proposition. Include 5-7 key features.
            """
        elif prompt.prompt_type == "seo_keywords":
            ai_prompt = f"""
            You are an SEO expert. Generate a list of relevant keywords and search terms for the following product:

            Product Name: {product['name']}
            Category: {product.get('category', 'N/A')}
            Description: {product.get('description', 'N/A')}

            Include a mix of short-tail and long-tail keywords. Focus on terms with high search intent.
            """
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid prompt type. Supported types: title, description, features, seo_keywords"
            )

        # Store the generated content in the database
        content_entry = {
            "product_id": str(product['_id']),
            "content_type": prompt.prompt_type,
            "content": ai_prompt,  # Replace with actual AI-generated content
            "generated_at": datetime.utcnow(),
            "user_id": str(current_user['_id'])
        }
        
        result = await db['generated_content'].insert_one(content_entry)
        
        # Fetch the created content
        created_content = await db['generated_content'].find_one({"_id": result.inserted_id})
        created_content['_id'] = str(created_content['_id'])
        
        return AIResponse(
            content=created_content['content'],
            content_type=created_content['content_type'],
            generated_at=created_content['generated_at']
        )
            
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/history/{product_id}", response_model=List[AIResponse])
async def get_content_history(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Validate ObjectId
        object_id = ObjectId(product_id)
        
        # Verify product belongs to user
        product = await db['products'].find_one({
            "_id": object_id,
            "user_id": str(current_user['_id'])
        })
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Fetch content history
        content_history = await db['generated_content'].find({
            "product_id": product_id,
            "user_id": str(current_user['_id'])
        }).sort("generated_at", -1).to_list(length=100)
        
        # Convert ObjectIds to strings
        for content in content_history:
            content['_id'] = str(content['_id'])
        
        return content_history
            
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/history/{content_id}")
async def delete_content(
    content_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Validate ObjectId
        object_id = ObjectId(content_id)
        
        # Verify content belongs to user
        content = await db['generated_content'].find_one({
            "_id": object_id,
            "user_id": str(current_user['_id'])
        })
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found"
            )
        
        # Delete content
        await db['generated_content'].delete_one({"_id": object_id})
        
        return {"message": "Content deleted successfully"}
            
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid content ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
