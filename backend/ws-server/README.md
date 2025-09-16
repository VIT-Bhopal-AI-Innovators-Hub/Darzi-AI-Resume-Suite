# Hugging Face Spaces config
---
title: LaTeX Compile Server
emoji: 📝
colorFrom: blue
colorTo: indigo
sdk: docker
sdk_version: "1.0"
app_file: ws-server.js
pinned: false
---

# LaTeX Compile Server

This is a WebSocket-based server that compiles LaTeX code into PDF documents in real-time.

## Overview

The server listens for WebSocket connections on port 58404 and accepts LaTeX source code. It compiles the code using `latexmk` and returns the generated PDF as a base64-encoded string.

## Features

- Real-time LaTeX compilation
- WebSocket-based communication
- Automatic cleanup of temporary files
- Timeout protection (30 seconds)
- Error handling and reporting

## Starting the Server

From the project root directory, run:

```bash
docker compose up
```

This will build the image and start the container with the correct port mapping (58404:58404).

## Usage

Connect to the WebSocket server at `ws://localhost:58404`.

Send a message in the following JSON format:
```json
{
  "type": "edit",
  "tex": "\\documentclass{article}\\begin{document}Hello World\\end{document}"
}
```

The server will respond with:
- Progress messages: `{ "type": "progress", "text": "..." }`
- PDF result: `{ "type": "pdf", "base64": "..." }`
- Errors: `{ "type": "error", "message": "..." }`

## License

MIT
