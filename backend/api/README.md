---
title: Darzi Backend API
emoji: 📃
colorFrom: green
colorTo: yellow
sdk: docker
---

# Darzi Backend API

This directory contains the source code for the Darzi AI Resume Suite backend API, built using FastAPI. The API combines resume parsing capabilities with advanced text extraction from documents.

## Features

### Resume Parsing
- **Hybrid Resume Parsing**: Uses both local spaCy-based parser and MCP server for enhanced results
- **ATS Optimization**: Provides ATS compatibility scoring and optimization suggestions
- **Multiple Input Formats**: Supports both PDF file uploads and raw text input
- **AI-Enhanced Analysis**: Leverages AI models for improved parsing accuracy

### Text Extraction
- **PDF Text Extraction**: Extract text from PDF files using Google Vision API
- **Text File Support**: Direct reading of text files (no API cost)
- **Google Drive Integration**: Download and process files from Google Drive links
- **Cost Optimized**: Text files read directly, Vision API only for PDFs/images

## Supported File Types

| File Type | Processing Method | API Cost |
|-----------|------------------|----------|
| `.pdf` | Google Vision API / Local | ✅ Paid (Vision) / ❌ Free (Local) |
| `.txt`, `.md`, `.csv`, `.log` | Direct reading | ❌ Free |
| `.png`, `.jpg`, `.jpeg`, `.gif` | Google Vision API | ✅ Paid |
| Google Drive URLs | Auto-detect & process | Varies |

### Important Links
- HuggingFace Repo: [https://huggingface.co/spaces/VIT-Bhopal-AI-Innovators-Hub/darzi-api-server](https://huggingface.co/spaces/VIT-Bhopal-AI-Innovators-Hub/darzi-api-server)
- Deployment Link: [https://vit-bhopal-ai-innovators-hub-darzi-api-server.hf.space](https://vit-bhopal-ai-innovators-hub-darzi-api-server.hf.space)

## API Endpoints

### Resume Parsing Endpoints

#### `/parse` (POST)
Parse plain text resume data.
- **Input**: Raw text (Content-Type: text/plain)
- **Output**: Hybrid parsing results from both local parser and MCP server

#### `/parse-pdf` (POST) 
Parse PDF resume file.
- **Input**: PDF file upload (multipart/form-data)
- **Output**: Structured resume data extracted from PDF

#### `/optimize-ats` (POST)
Optimize resume for ATS compatibility.
- **Input**: JSON with resume_text and optional job_description
- **Output**: ATS score, suggestions, and optimization recommendations

### Text Extraction Endpoints

#### `/api/extract` (POST)
Extract text from uploaded files.
- **Input**: File upload (multipart/form-data) - supports PDF, images, text files
- **Output**: Extracted text content

#### `/api/extract-url` (POST)
Extract text from Google Drive URLs.
- **Input**: JSON with Google Drive URL
- **Output**: Extracted text content

### Utility Endpoints

#### `/health` (GET)
Health check with service status information.

#### `/mcp-status` (GET)
Check MCP service status and available tools.

#### `/healthz` (GET)
Simple health check endpoint.

## Setup

### Environment Variables

Required for text extraction functionality:
- `GOOGLE_API_KEY`: Google Cloud Vision API key (required for PDF and image processing)

Optional:
- `APP_MODE`: Set to "api" for API mode or "ui" for UI mode (default: "api")
- `API_CORS_ORIGINS`: Comma-separated list of allowed origins or "*" for all

### Local Development

1. Install dependencies:
```bash
# Using uv (recommended)
uv sync
uv run python -m spacy download en_core_web_sm

# Or using pip
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

2. Set up environment variables:
```bash
# Create .env file
echo "GOOGLE_API_KEY=your_api_key_here" > .env
```

3. Run the server:
```bash
python main.py
# Server will be available at http://localhost:7860
```

### Testing the API

#### Test Resume Parsing:
```bash
# Test text parsing
curl -X POST http://localhost:7860/parse \
  -H "Content-Type: text/plain" \
  -d "John Doe. Email: john.doe@example.com. Phone: 1234567890. Python developer with 5 years experience at Google."

# Test PDF parsing
curl -X POST http://localhost:7860/parse-pdf \
  -F 'file=@path/to/your/resume.pdf'
```

#### Test Text Extraction:
```bash
# Extract text from file
curl -X POST http://localhost:7860/api/extract \
  -F 'file=@path/to/document.pdf'

# Extract from Google Drive URL
curl -X POST http://localhost:7860/api/extract-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://drive.google.com/file/d/FILE_ID/view"}'
```

#### Test ATS Optimization:
```bash
curl -X POST http://localhost:7860/optimize-ats \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "John Doe. Software Engineer...",
    "job_description": "Looking for Python developer..."
  }'
```

#### Expected Response Format:

**Resume Parsing Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": ["john.doe@example.com"],
    "mobile_number": ["1234567890"],
    "skills": ["Python", "JavaScript", "React"],
    "education": ["Bachelor of Science", "University Name"],
    "experience": [{"title": "Software Engineer", "company": "Google"}],
    "summary": "Experienced software engineer...",
    "certifications": [],
    "raw_text": "First 500 characters of extracted text...",
    "parsing_source": "hybrid",
    "confidence_score": 0.85
  },
  "metadata": {
    "parsing_method": "hybrid",
    "confidence": 0.85
  }
}
```

**Text Extraction Response:**
```json
{
  "success": true,
  "text": "Extracted text content from the document...",
  "file_info": {
    "name": "document.pdf",
    "size": "1.2 MB",
    "type": "vision"
  }
}
```

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t darzi-backend-api .
```

2. Run the Docker container:
```bash
docker run -p 7860:7860 darzi-backend-api
```

3. Access the API at `http://localhost:7860/`.

### Hugging Face Deployment

The API is configured for Hugging Face Spaces deployment:

1. **Environment Variables**:
   - `GOOGLE_API_KEY`: Add as a Secret in your Space settings
   - `APP_MODE`: Set as "api" in Space variables (default)
   - `API_CORS_ORIGINS`: Configure allowed origins if needed

2. **Docker Configuration**: The included Dockerfile is optimized for HF Spaces

3. **Access**: Use the Space URL for API endpoints

## Cost Considerations

- **Text files**: Free (direct reading)
- **PDF files**: ~$1.50 per 1,000 pages (Google Vision API)
- **Images**: ~$1.50 per 1,000 images (Google Vision API)
- **Resume parsing**: Local parsing is free, MCP service costs may apply

## File Structure

```
api/
├── data_extractor/
│   ├── __init__.py
│   ├── core.py          # Text extraction logic
│   └── utils.py         # Helper functions
├── utils/
│   ├── __init__.py
│   └── parser.py        # Resume parsing logic
├── main.py              # FastAPI application
├── pyproject.toml       # Dependencies
├── requirements.txt     # Pip requirements
├── Dockerfile          # Docker configuration
└── README.md           # This file
```

## Organization

This project is developed by VIT Bhopal AI Innovators Hub as part of the Darzi AI Resume Suite.