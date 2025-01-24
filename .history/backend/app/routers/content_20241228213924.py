from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import AIPrompt, AIResponse, ChatHistory, ChatMessage
from ..auth import get_current_user
from ..database import db
from bson.objectid import ObjectId
from bson.errors import InvalidId
from meta_ai_api import MetaAI
from datetime import datetime
from typing import List
import json
import asyncio
from fastapi.responses import StreamingResponse
from fastapi.responses import JSONResponse

router = APIRouter(
    prefix="/content",
    tags=["AI Content Generation"],
    dependencies=[Depends(get_current_user)]
)

# Initialize Meta AI client
ai = MetaAI()

@router.post("/generate", response_model=AIResponse)
async def generate_content(prompt: AIPrompt, current_user: dict = Depends(get_current_user)):
    try:
        # Validate ObjectId and fetch product details
        product = await db['products'].find_one({
            "_id": ObjectId(prompt.product_id), 
            "user_id": str(current_user['_id'])
        })
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        sentiment = prompt.sentiment.capitalize() if prompt.sentiment else 'Neutral'
        
        # Craft the prompt based on prompt_type
        if prompt.prompt_type == "full_listing":
            ai_prompt = f"""
            You are an expert product marketer and copywriter. Based on the following product details, generate a complete e-commerce listing that includes Titles, Descriptions, Highlighted/Bulleted Points, and a Competition Analysis.

            Product Name: {product['name']}
            Category: {product.get('category', 'N/A')}
            Description: {product.get('description', 'N/A')}
            Competitor URLs: {', '.join(product.get('competitor_urls', []))}
            Price: {product.get('price', 'N/A')} {product.get('currency', 'USD')}
            Sentiment: {sentiment}

            Ensure the content is {sentiment.lower()} and optimized for SEO. The competition analysis should include insights gathered from the provided competitor links.
            """
        elif prompt.prompt_type == "title":
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
            competitors = await db['competitors'].find(
                {"product_id": prompt.product_id}
            ).to_list(length=100)
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
                detail="Invalid prompt type. Must be one of: title, description, seo, full_listing"
            )
        
        # Generate content using Meta AI
        try:
            response = ai.prompt(ai_prompt)
            
            # Store generated content in database
            content_doc = {
                "product_id": prompt.product_id,
                "content_type": prompt.prompt_type,
                "content": response,
                "generated_at": datetime.utcnow()
            }
            
            await db['generated_content'].insert_one(content_doc)
            
            # Return the generated content
            return AIResponse(
                content=response['message'],
                content_type=prompt.prompt_type,
                product_id=prompt.product_id
            )
            
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )

@router.get("/history/{product_id}", response_model=List[AIResponse])
async def get_content_history(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Validate product ownership
        product = await db['products'].find_one({
            "_id": ObjectId(product_id),
            "user_id": str(current_user['_id'])
        })
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Fetch content history
        content_history = await db['generated_content'].find({
            "product_id": product_id
        }).sort("generated_at", -1).to_list(length=100)
        
        return [
            AIResponse(
                content=content['content'],
                content_type=content['content_type'],
                product_id=content['product_id'],
                generated_at=content['generated_at']
            ) for content in content_history
        ]
        
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

@router.delete("/history/{content_id}")
async def delete_generated_content(
    content_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Fetch content to verify ownership
        content = await db['generated_content'].find_one({
            "_id": ObjectId(content_id)
        })
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content not found"
            )
        
        # Verify product ownership
        product = await db['products'].find_one({
            "_id": ObjectId(content['product_id']),
            "user_id": str(current_user['_id'])
        })
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this content"
            )
        
        # Delete the content
        result = await db['generated_content'].delete_one({
            "_id": ObjectId(content_id)
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete content"
            )
        
        return {"message": "Content deleted successfully"}
        
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid content ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )

@router.post("/chat")
async def chat_with_product(chat: ChatHistory, current_user: dict = Depends(get_current_user)):
    try:
        # Validate and fetch product
        product = await db['products'].find_one({
            "_id": ObjectId(chat.product_id),
            "user_id": str(current_user['_id'])
        })
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        conversation = "You are a helpful AI assistant for an e-commerce product. Provide accurate and relevant information about the product.\n\n"
        
        for msg in chat.messages:
            if msg.sender == 'user':
                conversation += f"User: {msg.message}\n"
            else:
                conversation += f"Assistant: {msg.message}\n"
        
        product_info = f"""
        Product Information:
        Name: {product['name']}
        Category: {product.get('category', 'N/A')}
        Description: {product.get('description', 'N/A')}
        Price: {product.get('price', 'N/A')} {product.get('currency', 'USD')}
        """
        conversation += product_info
        
        # Use the synchronous method instead of awaiting
        response = ai.prompt(conversation)
        
        return JSONResponse({
            "content": response["message"] if isinstance(response, dict) else response
        })

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )