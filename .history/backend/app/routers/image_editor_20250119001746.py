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
from rembg import remove
import numpy as np

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
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Cloudflare API error: {response.text}"
            )
            
        result = response.json()
        
        # Handle the nested dictionary structure
        if isinstance(result, dict):
            if 'result' in result:
                base64_data = result['result']
                if isinstance(base64_data, dict) and 'image' in base64_data:
                    base64_str = base64_data['image']
                elif isinstance(base64_data, str):
                    base64_str = base64_data
                else:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Unexpected data format in result: {type(base64_data)}"
                    )
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Missing 'result' key in response"
                )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected response type: {type(result)}"
            )
        
        # Clean up the base64 string
        base64_str = base64_str.strip("'").strip('"')
        
        # Return the cleaned base64 string
        return {"image": base64_str}
        
    except Exception as e:
        print(f"Error in generate_background: {str(e)}")
        import traceback
        print("Full traceback:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
                
@router.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    try:
        # Read image file
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))
        
        # Convert RGBA to RGB if needed
        if input_image.mode == 'RGBA':
            input_image = input_image.convert('RGB')
        
        # Resize large images to improve processing speed
        max_size = 1500
        if max(input_image.size) > max_size:
            ratio = max_size / max(input_image.size)
            new_size = tuple(int(dim * ratio) for dim in input_image.size)
            input_image = input_image.resize(new_size, Image.Resampling.LANCZOS)
        
        print("Processing image removal...")
        # Remove background
        output_image = remove(input_image)
        print("Background removed successfully")
        
        # Convert to base64
        buffered = io.BytesIO()
        output_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return {"image": f"data:image/png;base64,{img_str}"}
        
    except Exception as e:
        print(f"Error in remove_background: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/harmonize")
async def harmonize_images(project: ImageEditorProject, current_user: dict = Depends(get_current_user)):
    try:
        # Convert base64 strings to PIL Images
        background_image = Image.open(io.BytesIO(base64.b64decode(project.background_image)))
        product_image = Image.open(io.BytesIO(base64.b64decode(project.product_image)))
        
        # Convert images to numpy arrays for processing
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