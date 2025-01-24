# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import UserCreate, UserOut, UserLogin, Token
from ..database import db
from ..utils import get_password_hash, verify_password, create_access_token
from datetime import timedelta
from bson.objectid import ObjectId

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    existing_user = await db['users'].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict['password_hash'] = hashed_password
    del user_dict['password']
    result = await db['users'].insert_one(user_dict)
    created_user = await db['users'].find_one({"_id": result.inserted_id})
    return UserOut(**created_user)

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db_user = await db['users'].find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES")))
    access_token = create_access_token(
        data={"sub": str(db_user['_id'])}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}