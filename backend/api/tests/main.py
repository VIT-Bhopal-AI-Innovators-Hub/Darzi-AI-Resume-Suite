import requests

url = "http://localhost:7860/ats-checker"
file_path = "./temp/Arpit_Sengar_22BAI10202_Resume.pdf"

with open(file_path, "rb") as f:
    files = {"resume_file": (file_path, f, "application/pdf")}
    
    data = {
        "job_description": "Looking for a software engineer skilled in Python, ML, and cloud computing."
    }
    response = requests.post(url, files=files, data=data)

print("Status:", response.status_code)
print("Response:", response.json())