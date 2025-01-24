from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from ..schemas import ImageGenerationPrompt, BackgroundRemovalRequest, ImageEditorProject
from ..auth import get_current_user
from ..database import db
from bson.objectid import ObjectId
import httpx
import base64
from PIL import Image
import io
from datetime import datetime

router = APIRouter(
    prefix="/image-editor",
    tags=["Image Editor"]
)

@router.post("/generate")
async def generate_background(prompt: ImageGenerationPrompt, current_user: dict = Depends(get_current_user)):
    try:
        url = "https://api.cloudflare.com/client/v4/accounts/da5df721f9ce08ef6eabbede11dc35ba/ai/run/@cf/black-forest-labs/flux-1-schnell"
        
        headers = {
            "Authorization": f"Bearer mjmuMe_-1mNvt9SkcyRCUIP7JtMO63yifNJE19AD",
            "Content-Type": "application/json"
        }
        
        payload = {
            "prompt": prompt.prompt,
            "num_steps": prompt.steps or 4
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to generate image")
            
        # The response contains base64 encoded image
        result = response.json()
        if 'result' in result:
            return {"image": result['result']}
        raise HTTPException(status_code=500, detail="Invalid response from image generation service")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    try:
        # Read the uploaded file
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))
        
        # Remove background using rembg
        from rembg import remove
        output_image = remove(input_image)
        
        # Convert to base64
        buffered = io.BytesIO()
        output_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return {"image": img_str}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/harmonize")
async def harmonize_images(project: ImageEditorProject, current_user: dict = Depends(get_current_user)):
    try:
        # Convert base64 strings to PIL Images
        background_image = Image.open(io.BytesIO(base64.b64decode(project.background_image)))
        product_image = Image.open(io.BytesIO(base64.b64decode(project.product_image)))
        
        # Convert images to numpy arrays for processing
        import numpy as np
        bg_array = np.array(background_image)
        prod_array = np.array(product_image)
        
        # Calculate average brightness of background
        bg_brightness = np.mean(bg_array)
        
        # Calculate average brightness of product
        prod_brightness = np.mean(prod_array)
        
        # Calculate brightness ratio
        brightness_ratio = bg_brightness / prod_brightness if prod_brightness > 0 else 1
        
        # Adjust product image brightness
        adjusted_prod_array = np.clip(prod_array * brightness_ratio, 0, 255).astype(np.uint8)
        adjusted_prod_image = Image.fromarray(adjusted_prod_array)
        
        # Convert back to base64
        buffered = io.BytesIO()
        adjusted_prod_image.save(buffered, format="PNG")
        adjusted_img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return {"image": adjusted_img_str}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))