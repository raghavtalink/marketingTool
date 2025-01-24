from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from ..schemas import ImageGenerationPrompt, BackgroundRemovalRequest, ImageEditorProject
from ..auth import get_current_user
from ..database import db
from bson.objectid import ObjectId
import httpx
import base64
from PIL import Image
import io
from rembg import remove
import numpy as np
from datetime import datetime
import os

router = APIRouter(
    prefix="/image-editor",
    tags=["Image Editor"],
    dependencies=[Depends(get_current_user)]
)

CLOUDFLARE_ACCOUNT_ID = "da5df721f9ce08ef6eabbede11dc35ba"
CLOUDFLARE_API_TOKEN = "mjmuMe_-1mNvt9SkcyRCUIP7JtMO63yifNJE19AD"

async def generate_background(prompt: str, steps: int = 4):
    url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell"
    
    # Enhance prompt for product photography
    enhanced_prompt = f"Minimalistic and versatile professional free of any objects, products, or equipment product photography setup with clean, neutral background featuring {prompt}, designed for seamless product overlay, high-quality studio lighting, 8k resolution, photorealistic, ensuring no visible product elements or distractions in the scene."
    
    payload = {
        "prompt": enhanced_prompt,
        "steps": steps
    }
    
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to generate image")
        return response.json()["image"]

@router.post("/generate-background")
async def create_background(prompt: ImageGenerationPrompt, current_user: dict = Depends(get_current_user)):
    try:
        image_base64 = await generate_background(prompt.prompt, prompt.steps)
        
        if prompt.product_id:
            # Save to database if product_id is provided
            project_data = {
                "user_id": str(current_user['_id']),
                "product_id": prompt.product_id,
                "background_image": image_base64,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db['image_editor_projects'].insert_one(project_data)
        
        return {"image": image_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/remove-background")
async def remove_background(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Read the uploaded image
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))
        
        # Remove background
        output_image = remove(input_image)
        
        # Convert to base64
        buffered = io.BytesIO()
        output_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return {"image": img_str}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/harmonize-lighting")
async def harmonize_lighting(
    background_image: str,
    product_image: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Convert base64 strings to PIL images
        bg_image = Image.open(io.BytesIO(base64.b64decode(background_image)))
        prod_image = Image.open(io.BytesIO(base64.b64decode(product_image)))
        
        # Convert images to numpy arrays
        bg_array = np.array(bg_image)
        prod_array = np.array(prod_image)
        
        # Calculate average lighting of background
        bg_brightness = np.mean(bg_array)
        
        # Adjust product image brightness
        prod_brightness = np.mean(prod_array)
        brightness_ratio = bg_brightness / prod_brightness
        
        # Apply brightness adjustment
        adjusted_prod_array = np.clip(prod_array * brightness_ratio, 0, 255).astype(np.uint8)
        adjusted_prod_image = Image.fromarray(adjusted_prod_array)
        
        # Convert back to base64
        buffered = io.BytesIO()
        adjusted_prod_image.save(buffered, format="PNG")
        adjusted_img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return {"image": adjusted_img_str}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save-project")
async def save_project(project: ImageEditorProject, current_user: dict = Depends(get_current_user)):
    try:
        project_dict = project.dict(exclude={'id'})
        project_dict['user_id'] = str(current_user['_id'])
        project_dict['updated_at'] = datetime.utcnow()
        
        result = await db['image_editor_projects'].insert_one(project_dict)
        
        return {"project_id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))