import requests


url = "http://localhost:7860/parse-data"
file_path = "./temp/Arpit_Sengar_22BAI10202_Resume.pdf"

with open(file_path, "rb") as f:
    files = [
        ("files", (file_path, f, "application/pdf"))
    ]

    response = requests.post(url, files=files)

print("Status:", response.status_code)
print("Response:", response.json())