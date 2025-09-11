FROM python:3.11-slim

LABEL org.opencontainers.image.title="Darzi AI Resume Suite API"
LABEL org.opencontainers.image.description="AI-powered resume processing and generation API"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="VIT Bhopal AI Innovators Hub"

WORKDIR /code

# Install system dependencies for production
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install uv package manager for faster dependency management
RUN pip install --no-cache-dir uv

# Set up virtual environment
ENV VIRTUAL_ENV=/code/.venv
RUN uv venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy dependency files first for better Docker layer caching
COPY requirements.txt pyproject.toml uv.lock* ./

# Install Python dependencies
RUN uv pip install --no-cache -r requirements.txt

# Copy source code
COPY . /code

# Install project in production mode
RUN uv pip install -e . --no-deps

# Set production environment variables
ENV PORT=7860
ENV PYTHONPATH=/code/src:/code
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Security and performance optimizations
ENV WORKERS=1
ENV TIMEOUT_KEEP_ALIVE=30
ENV LIMIT_MAX_REQUESTS=1000

EXPOSE $PORT

# Health check for production monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl --fail http://localhost:7860/health || exit 1

# Production startup command with correct uvicorn options
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT} --workers ${WORKERS} --timeout-keep-alive ${TIMEOUT_KEEP_ALIVE} --limit-max-requests ${LIMIT_MAX_REQUESTS}"]