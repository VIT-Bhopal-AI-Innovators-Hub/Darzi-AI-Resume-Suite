#!/usr/bin/env python3
"""
Production-ready entry point for Darzi AI Resume Suite FastAPI application
"""

import sys
import os
import logging
from pathlib import Path

# Configure logging for production
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Add src directory to Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

try:
    # Import the FastAPI app from src/app.py
    from src.app import app
    logger.info("✅ FastAPI application imported successfully")
except ImportError as e:
    logger.error(f"❌ Failed to import FastAPI app: {e}")
    sys.exit(1)

# Export app for uvicorn
__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "7860"))
    workers = int(os.getenv("UVICORN_WORKERS", "1"))
    reload = os.getenv("DEBUG", "false").lower() == "true"
    
    logger.info(f"🚀 Starting Darzi AI Resume Suite API server")
    logger.info(f"📡 Host: {host}:{port}")
    logger.info(f"👥 Workers: {workers}")
    logger.info(f"🔄 Reload: {reload}")
    
    uvicorn.run(
        "main:app",  # Use string import for production
        host=host,
        port=port,
        workers=workers,
        reload=reload,
        timeout_keep_alive=30,
        access_log=True
    )