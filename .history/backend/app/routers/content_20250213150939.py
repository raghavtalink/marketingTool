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
import requests
import re

router = APIRouter(
    prefix="/content",
    tags=["AI Content Generation"],
    dependencies=[Depends(get_current_user)]
)

# Add configurations
GOOGLE_API_KEY = "AIzaSyCyX75raXw968VIaPGdbfuzp1NnWsHKKYY"
CX = "628284219f29c4910"
CLOUDFLARE_API_URL = "https://api.cloudflare.com/client/v4/accounts/4825492e4a93a826f5d32b94a692795f/ai/run/@cf/meta/llama-3-8b-instruct"
CLOUDFLARE_AUTH_TOKEN = "Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D"

# Replace MetaAI initialization with custom functions
def call_llama3(prompt, structured_context=""):
    """Pass prompt to Cloudflare Meta Llama-3"""
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    
    user_message = prompt
    if structured_context:
        user_message += f"\n\nWeb Data:\n{structured_context}\n\nUse the above data to generate an answer."
    
    payload = {
        "messages": [
            {"role": "system", "content": "You are an AI assistant with internet access. Use the provided data to answer queries accurately."},
            {"role": "user", "content": user_message}
        ]
    }

    print("\n🚀 Sending request to Llama-3...")
    print("Payload:", json.dumps(payload, indent=2))
    
    response = requests.post(CLOUDFLARE_API_URL, headers=headers, data=json.dumps(payload))

    if response.status_code != 200:
        raise Exception(f"Error in Llama 3 API: {response.text}")
    
    data = response.json()
    print("\n🔹 Raw Llama-3 response:", json.dumps(data, indent=2))
    
    return data.get("result", {}).get("response", "No response generated.")

# Add the google_search function
def google_search(query):
    """Fetch search results from Google Custom Search JSON API"""
    print(f"\n🔍 Starting Google Search for: {query}")
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={GOOGLE_API_KEY}&cx={CX}"
    
    try:
        print("Making request to Google API...")
        response = requests.get(url)
        print(f"Google API Response Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Error response from Google: {response.text}")
            return ""

        data = response.json()
        print("Successfully got JSON response from Google")
        
        # Extract top search results
        results = []
        if "items" in data:
            print(f"Found {len(data['items'])} search results")
            for item in data["items"][:3]:
                results.append(item["snippet"])
                print(f"Added snippet: {item['snippet'][:100]}...")
        else:
            print("No items found in Google response")
            print("Full response:", data)

        combined_text = " ".join(results)
        
        # Extract date using regex
        match = re.search(r"\b(\d{1,2}\s\w+\s\d{4}|\w+\s\d{1,2},\s\d{4}|\d{4}-\d{2}-\d{2})\b", combined_text)
        date_info = match.group(0) if match else "Date not found."
        print(f"Extracted date: {date_info}")

        structured_context = f"Latest Market Data (as of {date_info}):\n\n{combined_text}"
        print("\n📝 Final structured context:")
        print(structured_context)
        return structured_context
        
    except Exception as e:
        print(f"❌ Error in google_search: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print("Traceback:", traceback.format_exc())
        return ""

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
            response = call_llama3(ai_prompt)
            
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
                content=response,
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
async def chat_with_product(
    chat: ChatHistory, 
    search_web: bool = True,
    current_user: dict = Depends(get_current_user)
):
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
        
        # Get the last user message
        last_message = next((msg.message for msg in reversed(chat.messages) 
                           if msg.sender == 'user'), None)
        
        web_data = ""
        if search_web and last_message:
            try:
                print(f"\n🔎 Search requested for message: {last_message}")
                # Make the search query more specific
                search_query = f"Tell me ab {last_message}"
                print(f"Enhanced search query: {search_query}")
                
                web_data = google_search(search_query)
                if web_data:
                    print("\n✅ Successfully got web data")
                else:
                    print("\n⚠️ No web data returned")
            except Exception as e:
                print(f"\n❌ Error during web search: {str(e)}")
                print(f"Error type: {type(e)}")
                import traceback
                print("Traceback:", traceback.format_exc())
                web_data = ""
        
        conversation = f"""You are an AI assistant specializing in e-commerce and product marketing.
        IMPORTANT: When web data is provided, you MUST use that information as your primary source for current market comparisons and specifications.
        If web data shows different specifications or prices than what you know, ALWAYS prefer the web data as it is more current.
        
        Product Information:
        Name: {product['name']}
        Category: {product.get('category', 'N/A')}
        Description: {product.get('description', 'N/A')}
        Price: {product.get('price', 'N/A')} {product.get('currency', 'USD')}
        
        User Query: {last_message}
        """
        
        if web_data:
            conversation += f"\n\nLatest Web Data:\n{web_data}"
        
        response = call_llama3(conversation)
        
        return JSONResponse({
            "content": response,
            "format": "html",
            "web_data_used": bool(web_data)
        })

    except Exception as e:
        print(f"❌ Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )