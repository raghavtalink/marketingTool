from fastapi import FastAPI
from .routers import auth, content, products, social_media, market_analysis, image_editor
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
    allow_origins=origins,  # Use specific origins instead of ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(content.router)
app.include_router(products.router)
app.include_router(social_media.router)
app.include_router(market_analysis.router)
app.include_router(image_editor.router) 