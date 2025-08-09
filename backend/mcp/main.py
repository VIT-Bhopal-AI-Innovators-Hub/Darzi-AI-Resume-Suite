import json
from fastmcp import FastMCP

SAMPLE_DATA = {
    "name": "John Doe",
    "age": 21,
    "email": "john.doe@email.com",
    "phone": "555-123-4567",
    "linkedin": "linkedin.com/in/johndoe",
    "github": "github.com/johndoe",
    "summary": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    "experience": [
        {
            "title": "Software Engineer",
            "company": "Tech Solutions Inc.",
            "location": "San Francisco, CA",
            "dates": "Jan 2023 - Present",
            "responsibilities": [
                "Developed and maintained web applications using React and Node.js.",
                "Collaborated with a team of 5 engineers to deliver new features.",
                "Implemented RESTful APIs and integrated with various databases."
            ]
        },
        {
            "title": "Junior Developer",
            "company": "Innovate Ltd.",
            "location": "New York, NY",
            "dates": "Jun 2021 - Dec 2022",
            "responsibilities": [
                "Assisted in the development of mobile applications.",
                "Wrote unit tests and performed code reviews.",
                "Debugged and resolved software defects."
            ]
        }
    ],
    "education": [
        {
            "degree": "B.S. in Computer Science",
            "university": "State University",
            "location": "State College, PA",
            "dates": "Sep 2017 - May 2021"
        }
    ],
    "skills": {
        "programming_languages": [
            "Python",
            "JavaScript",
            "Java"
        ],
        "frameworks": [
            "React",
            "Node.js",
            "Django"
        ],
        "databases": [
            "MongoDB",
            "MySQL",
            "PostgreSQL"
        ],
        "tools": [
            "Git",
            "Docker",
            "AWS"
        ]
    },
    "projects": [
        {
            "name": "Darzi",
            "description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            "technologies": [
                "ESP8266",
                "MongoDB",
                "React Native",
                "Node.js"
            ],
            "url": "github.com/johndoe/darzi"
        }
    ]
}

mcp = FastMCP("Darzi Demo MCP Server")

@mcp.tool
def extract_data(text: str) -> str:
    return json.dumps(SAMPLE_DATA)

if __name__ == "__main__":
    mcp.run()