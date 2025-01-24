from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import AIPrompt, AIResponse, ChatHistory, ChatMessage
from ..auth import get_current_user
from ..database import db
from bson.objectid import ObjectId
from bson.errors import InvalidId
from meta_ai_api import MetaAI
from datetime import datetime
from typing import List

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
            generated_content = ai.generate(ai_prompt)
            # Parse and structure the generated content as needed
            return AIResponse(content=generated_content, content_type="full_listing", product_id=prompt.product_id)
        
        elif prompt.prompt_type == "title":
            # Existing title generation logic
            pass
        elif prompt.prompt_type == "description":
            # Existing description generation logic
            pass
        elif prompt.prompt_type == "seo":
            # Existing SEO keywords generation logic
            pass

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

@router.post("/chat", response_model=ChatHistory)
async def chat_with_product(chat: ChatHistory, current_user: dict = Depends(get_current_user)):
    try:
        product = await db['products'].find_one({
            "_id": ObjectId(chat.product_id),
            "user_id": str(current_user['_id'])
        })
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Construct conversation context
        conversation = ""
        for msg in chat.messages:
            if msg.sender == 'user':
                conversation += f"User: {msg.message}\n"
            else:
                conversation += f"Product: {msg.message}\n"

        # Append product data to context
        product_info = f"""
        Product Name: {product['name']}
        Category: {product.get('category', 'N/A')}
        Description: {product.get('description', 'N/A')}
        Price: {product.get('price', 'N/A')} {product.get('currency', 'USD')}
        """
        conversation += product_info

        # Generate bot response using MetaAI
        bot_response = ai.generate_response(conversation)

        # Append bot response to chat history
        new_message = ChatMessage(message=bot_response, sender='bot')
        chat.messages.append(new_message)

        # Optionally, store chat history in the database
        await db['chat_history'].insert_one(chat.dict())

        return chat
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
