# HuggingFace Spaces optimized Dockerfile
FROM python:3.11-slim

LABEL org.opencontainers.image.title="Darzi AI Resume Suite API"
LABEL org.opencontainers.image.description="AI-powered resume processing and generation API"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="VIT Bhopal AI Innovators Hub"

WORKDIR /code

# Install system dependencies efficiently
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install uv package manager for faster dependency management
RUN pip install --no-cache-dir uv==0.1.35

# Set up virtual environment
ENV VIRTUAL_ENV=/code/.venv
RUN uv venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy dependency files first for better Docker layer caching
COPY requirements.txt pyproject.toml uv.lock* ./

# Install Python dependencies
RUN uv pip install --no-cache -r requirements.txt

# Install spaCy language model with fallback approach
RUN /code/.venv/bin/python -m spacy download en_core_web_sm --quiet || \
    uv pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl

# Copy source code and startup script
COPY src/ ./src/
COPY main.py startup.sh ./

# Make startup script executable
RUN chmod +x startup.sh

# Install project in development mode
RUN uv pip install -e . --no-deps

# Set optimized environment variables for production
ENV PORT=7860
ENV PYTHONPATH=/code/src:/code
ENV APP_MODE=api
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# HuggingFace Spaces specific optimization
ENV SPACES_CHECKPOINT_PRIMARY=1
ENV TRANSFORMERS_CACHE=/tmp/transformers_cache

# Create necessary directories
RUN mkdir -p /tmp/transformers_cache

EXPOSE $PORT

# Improved health check for HuggingFace Spaces
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import requests; import os; requests.get(f'http://localhost:{os.getenv(\"PORT\", \"7860\")}/health', timeout=5).raise_for_status()" || exit 1

# Optimized startup command with pre-setup
CMD ["sh", "-c", "./startup.sh && if [ \"$APP_MODE\" = \"ui\" ]; then streamlit run src/streamlit_app.py --server.port=${PORT} --server.address=0.0.0.0 --server.headless=true --server.enableCORS=false --server.enableXsrfProtection=false; else uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers 1 --timeout-keep-alive 30; fi"]
