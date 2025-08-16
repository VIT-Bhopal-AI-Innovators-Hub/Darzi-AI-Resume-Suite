#!/usr/bin/env python3
"""
MCP Client for Resume Parser
This client can be used to test the MCP server independently
or as a standalone client for other applications
"""

import asyncio
import json
from typing import Dict, Any, Optional
from fastmcp import Client

class ResumeParserMCPClient:
    def __init__(self, server_url: str = "stdio://python server.py"):

        self.server_url = server_url
        self.client: Optional[Client] = None
        self.connected = False
    
    async def connect(self):
        try:
            self.client = Client(self.server_url)
            await self.client.__aenter__()
            self.connected = True
            print("Connected to MCP server")
            return True
        except Exception as e:
            print(f"Failed to connect to MCP server: {e}")
            self.connected = False
            return False
    
    async def disconnect(self):
        if self.client and self.connected:
            try:
                await self.client.__aexit__(None, None, None)
                print("Disconnected from MCP server")
            except Exception as e:
                print(f"Error during disconnect: {e}")
        self.connected = False
    
    async def list_tools(self) -> list:
        if not self.connected:
            raise Exception("Not connected to MCP server")
        
        try:
            tools = await self.client.list_tools()
            return tools
        except Exception as e:
            print(f"Error listing tools: {e}")
            return []
    
    async def parse_resume(self, text: str) -> Dict[str, Any]:
        if not self.connected:
            raise Exception("Not connected to MCP server")
        
        try:
            result = await self.client.call_tool("parse_resume", {"text": text})
            return result
        except Exception as e:
            print(f"Error parsing resume: {e}")
            raise
    
    async def test_connection(self) -> bool:
        try:
            tools = await self.list_tools()
            return len(tools) > 0
        except:
            return False

async def test_mcp_client():
    sample_resume = """
    John Doe
    Senior Software Engineer
    john.doe@email.com
    +1-555-123-4567
    
    EXPERIENCE
    Senior Software Engineer - Tech Corp (2020-2023)
    - Developed Python applications using FastAPI
    - Led team of 5 developers
    - Improved system performance by 30%
    - Worked with AWS, Docker, and Kubernetes
    
    EDUCATION  
    Bachelor of Computer Science
    University of Technology
    
    SKILLS
    Python, JavaScript, React, SQL, AWS, Docker, Git
    Machine Learning, Data Analysis, FastAPI, Django
    """
    
    client = ResumeParserMCPClient()
    
    try:
        print("Connecting to MCP server...")
        if not await client.connect():
            print("Cannot connect to MCP server. Make sure server.py is running.")
            return
        
        print("\nListing available tools:-")
        tools = await client.list_tools()
        print(f"Available tools: {[tool.get('name', 'Unknown') for tool in tools]}")
        
        print("\nTesting connection...")
        if await client.test_connection():
            print("MCP server is responding")
        else:
            print("MCP server is not responding properly")
            return

        print("\nParsing sample resume...")
        result = await client.parse_resume(sample_resume)
        
        print("\n Parsing Results:")
        print("-" * 50)
        print(f"Name: {result.get('name', 'Not found')}")
        print(f"Email: {result.get('email', [])}")
        print(f"Phone: {result.get('mobile_number', [])}")
        print(f"Skills: {result.get('skills', [])[:5]}...")  #dhow first 5 skills
        print(f"Education: {len(result.get('education', []))} entries")
        print(f"Experience: {len(result.get('experience', []))} entries")
        print(f"Confidence: {result.get('parsing_confidence', 0):.2f}")
        
        print("\nFull Results (JSON):")
        print("-" * 50)
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error during testing: {e}")
    
    finally:
        await client.disconnect()

async def interactive_mode():

    client = ResumeParserMCPClient()
    
    try:
        print("Resume Parser MCP Client - Interactive Mode")
        print("=" * 50)
        
        if not await client.connect():
            print("Cannot connect to MCP server.")
            print("Make sure you're running: cd backend/mcp && python server.py")
            return
        
        while True:
            print("\nOptions:")
            print("1. Parse resume from text input")
            print("2. Parse resume from file")
            print("3. List available tools")
            print("4. Test connection")
            print("5. Exit")
            
            choice = input("\nEnter your choice (1-5): ").strip()
            
            if choice == "1":
                print("\nEnter resume text (press Enter twice when done):")
                lines = []
                while True:
                    line = input()
                    if line == "" and len(lines) > 0 and lines[-1] == "":
                        break
                    lines.append(line)
                
                resume_text = "\n".join(lines[:-1])
                
                if resume_text.strip():
                    try:
                        result = await client.parse_resume(resume_text)
                        print("\n📊 Parsing Results:")
                        print(f"Name: {result.get('name', 'Not found')}")
                        print(f"Email: {result.get('email', [])}")
                        print(f"Skills: {len(result.get('skills', []))} found")
                        print(f"Confidence: {result.get('parsing_confidence', 0):.2f}")
                    except Exception as e:
                        print(f"Error parsing resume: {e}")
                else:
                    print("No text entered")
            
            elif choice == "2":
                filename = input("Enter file path: ").strip()
                try:
                    with open(filename, 'r', encoding='utf-8') as f:
                        resume_text = f.read()
                    
                    result = await client.parse_resume(resume_text)
                    print(f"\nResults for {filename}:")
                    print(f"Name: {result.get('name', 'Not found')}")
                    print(f"Email: {result.get('email', [])}")
                    print(f"Skills: {len(result.get('skills', []))} found")
                    print(f"Confidence: {result.get('parsing_confidence', 0):.2f}")
                    
                except FileNotFoundError:
                    print(f"File not found: {filename}")
                except Exception as e:
                    print(f"Error: {e}")
            
            elif choice == "3":
                try:
                    tools = await client.list_tools()
                    print(f"\nAvailable tools: {len(tools)}")
                    for tool in tools:
                        print(f"  - {tool.get('name', 'Unknown')}: {tool.get('description', 'No description')}")
                except Exception as e:
                    print(f"Error listing tools: {e}")
            
            elif choice == "4":
                if await client.test_connection():
                    print("Connection is working!")
                else:
                    print("Connection test failed")
            
            elif choice == "5":
                print("Goodbye! hehehe")
                break
            
            else:
                print("Invalid choice. Please enter 1-5.")
    
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    
    except Exception as e:
        print(f"Unexpected error: {e}")
    
    finally:
        await client.disconnect()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        #un in interactive mode
        asyncio.run(interactive_mode())
    else:
        #run basic tests
        asyncio.run(test_mcp_client())