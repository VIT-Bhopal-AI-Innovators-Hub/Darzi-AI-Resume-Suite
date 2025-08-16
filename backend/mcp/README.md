---
title: Darzi MCP Backend
emoji: 📃
colorFrom: green
colorTo: yellow
sdk: docker
---


# MCP Backend API
This directory contains the source code for the backend API, built using FastMCP.

### Important Links
- HuggingFace Repo: [https://huggingface.co/spaces/VIT-Bhopal-AI-Innovators-Hub/darzi-mcp-server](https://huggingface.co/spaces/VIT-Bhopal-AI-Innovators-Hub/darzi-mcp-server)
- Deployment Link: [https://vit-bhopal-ai-innovators-hub-darzi-mcp-server.hf.space](https://vit-bhopal-ai-innovators-hub-darzi-mcp-server.hf.space)

## Setup
Using the provided Dockerfile, you can easily build and run the API container.

1. Build the Docker image:

```bash
docker build -t darzi-backend-api .
```

2. Run the Docker container:

```bash
docker run -p 7860:7860 darzi-backend-api
```

3. Access the server at `http://localhost:7860/mcp`.