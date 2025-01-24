from fastapi import FastAPI
from .routers import auth, content, products, social_media
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI-Powered Product Marketing Tool Backend",
    description="Backend API for managing users and AI content generation.",
    version="1.0.0",
)

# Setup CORS
origins = [
    "http://localhost:3000",  # React frontend URL
    "http://localhost",        # Additional origins if needed
    "http://localhost:8000",   # Backend URL (if accessing directly)
    ""
    # Add other origins as necessary
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Updated origins list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(content.router)
app.include_router(products.router)
app.include_router(social_media.router)