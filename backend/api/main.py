import uvicorn
from fastmcp import Client
from typing import Optional
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from utils import ResumeParser


MCP_ENDPOINT = "https://vit-bhopal-ai-innovators-hub-darzi-mcp-server.hf.space/mcp/"

app = FastAPI(title="Darzi Backend API")
origins = ["*"] # needs to changed in prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


client: Optional[Client] = None

@app.on_event("startup")
async def startup():
    global client
    client = Client(MCP_ENDPOINT)
    await client.__aenter__()

@app.on_event("shutdown")
async def shutdown():
    global client
    if client:
        await client.__aexit__(None, None, None)
        client = None

@app.post("/parse")
async def parse_plain(request: Request):
    body_bytes = await request.body()
    text = body_bytes.decode("utf-8").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty body; send raw text with Content-Type: text/plain")

    result = await client.call_tool("extract_data", {"text": text})
    return result


if __name__=="__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=7860)