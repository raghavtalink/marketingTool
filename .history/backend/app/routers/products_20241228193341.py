# app/routers/products.py
from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import ProductCreate, ProductOut
from ..auth import get_current_user
from ..database import db
from bson.objectid import ObjectId
from datetime import datetime
from typing import List

router = APIRouter(
    prefix="/products",
    tags=["Products"],
    dependencies=[Depends(get_current_user)]
)

@router.post("/", response_model=ProductOut)
async def create_product(product: ProductCreate, current_user: dict = Depends(get_current_user)):
    product_dict = product.dict()
    product_dict['user_id'] = str(current_user['_id'])
    now = datetime.utcnow()
    product_dict['created_at'] = now
    product_dict['updated_at'] = now
    
    result = await db['products'].insert_one(product_dict)
    created_product = await db['products'].find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string
    created_product['_id'] = str(created_product['_id'])
    # Ensure datetime objects are properly handled
    created_product['created_at'] = created_product['created_at']
    created_product['updated_at'] = created_product['updated_at']
    
    return ProductOut(**created_product)

@router.get("/", response_model=List[ProductOut])
async def get_products(current_user: dict = Depends(get_current_user)):
    products = await db['products'].find({"user_id": str(current_user['_id'])}).to_list(length=100)
    # Convert ObjectId to string for each product
    for product in products:
        product['_id'] = str(product['_id'])
    return products

