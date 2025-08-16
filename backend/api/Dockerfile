FROM python:3.11-slim

WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN pip install --no-cache-dir uv

# Set up virtual environment
ENV VIRTUAL_ENV=/code/.venv
RUN uv venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy project files
COPY . .

# Install dependencies
RUN uv pip install -e .

# Install UI dependencies if needed and spaCy model
RUN uv pip install streamlit>=1.28.0 && \
    uv pip install pip && \
    python -m spacy download en_core_web_sm

# Set environment variables
ENV PORT=7860
ENV PYTHONPATH=/code/src
ENV APP_MODE=api

EXPOSE $PORT

# Health check
HEALTHCHECK CMD python -c "import requests; requests.get(f'http://localhost:{__import__('os').getenv(\"PORT\", \"7860\")}/health' if __import__('os').getenv('APP_MODE') == 'api' else f'http://localhost:{__import__('os').getenv(\"PORT\", \"7860\")}/_stcore/health', timeout=10)" || exit 1

# Run either API or Streamlit UI based on APP_MODE
CMD ["sh", "-c", "if [ \"$APP_MODE\" = \"ui\" ]; then streamlit run src/api/streamlit_app.py --server.port=${PORT} --server.address=0.0.0.0; else uvicorn main:app --host 0.0.0.0 --port ${PORT}; fi"]
