from fastapi import FastAPI
from .routers import auth, content, products
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI-Powered Product Marketing Tool Backend",
    description="Backend API for managing users and AI content generation.",
    version="1.0.0",
)

# Setup CORS (Adjust origins as needed)
origins = [
    "http://localhost",
    "http://localhost:8000",
    # Add your frontend URL here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(content.router)
app.include_router(products.router)
