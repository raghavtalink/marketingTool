from fastapi import FastAPI
from .routers import auth, content, products, social_media
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI-Powered Product Marketing Tool Backend",
    description="Backend API for managing users and AI content generation.",
    version="1.0.0",
)

# Setup CORS with comprehensive origins
origins = [
    "http://localhost:3000",
    "http://localhost",
    "http://localhost:8000",
    "https://0c0bc2l9-3000.inc1.devtunnels.ms",
    "https://*.inc1.devtunnels.ms",
    "https://*.devtunnels.ms",
    # Allow all tunnel domains
    "https://*.ngrok.io",
    "https://*.ngrok-free.app",
    # Allow local network access
    "http://192.168.*.*",
    "http://172.16.*.*",
    "http://10.*.*.*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Include routers
app.include_router(auth.router)
app.include_router(content.router)
app.include_router(products.router)
app.include_router(social_media.router)