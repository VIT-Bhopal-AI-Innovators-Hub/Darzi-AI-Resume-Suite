#!/bin/bash

# HuggingFace Spaces pre-startup script
# This ensures environment variables are available before app starts

echo "🚀 Starting Darzi AI Resume Suite pre-startup setup..."

# Ensure environment variables are available
if [ -f "/tmp/secrets/GOOGLE_API_KEY" ]; then
    export GOOGLE_API_KEY=$(cat /tmp/secrets/GOOGLE_API_KEY)
    echo "✅ GOOGLE_API_KEY loaded from secrets"
fi

if [ -f "/tmp/secrets/GEMINI_API_KEY" ]; then
    export GEMINI_API_KEY=$(cat /tmp/secrets/GEMINI_API_KEY)
    echo "✅ GEMINI_API_KEY loaded from secrets"
fi

# Set default values if not provided
export GOOGLE_API_KEY=${GOOGLE_API_KEY:-""}
export GEMINI_API_KEY=${GEMINI_API_KEY:-""}
export APP_MODE=${APP_MODE:-"api"}
export PORT=${PORT:-"7860"}

# Test spaCy model availability
echo "🔍 Testing spaCy model availability..."
if /code/.venv/bin/python -c "import spacy; spacy.load('en_core_web_sm')" 2>/dev/null; then
    echo "✅ spaCy model is available"
else
    echo "⚠️  spaCy model not found, attempting fallback installation..."
    /code/.venv/bin/python -m spacy download en_core_web_sm --quiet || echo "❌ spaCy model installation failed"
fi

# Test API key availability (without exposing the keys)
if [ -n "$GOOGLE_API_KEY" ] && [ "$GOOGLE_API_KEY" != "" ]; then
    echo "✅ GOOGLE_API_KEY is configured"
else
    echo "⚠️  GOOGLE_API_KEY not found - LLM features will be limited"
fi

if [ -n "$GEMINI_API_KEY" ] && [ "$GEMINI_API_KEY" != "" ]; then
    echo "✅ GEMINI_API_KEY is configured"
else
    echo "⚠️  GEMINI_API_KEY not found - using GOOGLE_API_KEY for Gemini"
fi

echo "🎯 Pre-startup setup complete!"
echo "🚀 Starting application in mode: $APP_MODE on port: $PORT"
