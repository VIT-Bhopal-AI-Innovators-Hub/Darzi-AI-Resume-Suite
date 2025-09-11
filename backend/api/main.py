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

__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn
    
    HOST = "0.0.0.0"
    PORT = 7860
    WORKERS = 1
    RELOAD = True
    TIMEOUT_KEEP_ALIVE = 30
    LIMIT_MAX_REQUESTS = 1000
    
    logger.info(f"🚀 Starting Darzi AI Resume Suite API server")
    logger.info(f"📡 Host: {HOST}:{PORT}")
    logger.info(f"👥 Workers: {WORKERS}")
    logger.info(f"🔄 Reload: {RELOAD}")
    
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        workers=WORKERS,
        reload=RELOAD,
        timeout_keep_alive=TIMEOUT_KEEP_ALIVE,
        limit_max_requests=LIMIT_MAX_REQUESTS,
        access_log=True
    )