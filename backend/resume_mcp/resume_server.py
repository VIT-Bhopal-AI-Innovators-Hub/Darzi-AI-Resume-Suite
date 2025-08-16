import os 
from mcp.server.fastmcp import FastMCP 
from pypdf import PdfReader
from langchain_community.utilities import SerpAPIWrapper
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from urllib.request import urlopen
import requests
load_dotenv()

token = os.getenv("GITHUB_TOKEN")
server = FastMCP(name="Automated Resume maker")
search = SerpAPIWrapper()
def fetch_github_projects_with_readmes(username):
    """
    Returns a dictionary with repo names as keys and README contents as values.
    If README not found, sets value as None.
    """
    projects = {}
    api_url = f"https://api.github.com/users/{username}/repos"
    headers = {"Authorization": f"token {token}" , "Accept": "application/vnd.github.v3+json"}

    response = requests.get(api_url, headers=headers)

    if response.status_code != 200:
        raise Exception(f"Failed to fetch repositories: {response.status_code}")

    repos = response.json()

    for repo in repos:
        repo_name = repo["name"]
        
        readme_urls = [
            f"https://raw.githubusercontent.com/{username}/{repo_name}/main/README.md",
            f"https://raw.githubusercontent.com/{username}/{repo_name}/master/README.md",
        ]

        readme_content = None
        for url in readme_urls:
            r = requests.get(url)
            if r.status_code == 200:
                readme_content = r.text.strip()[:400]
                break
        projects[repo_name] = readme_content
    return projects


def read_the_paper_website_url(personal_website_url: str):
    page = urlopen(personal_website_url)
    html_bytes = page.read()
    html = html_bytes.decode("utf-8")

    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(["script", "style"]):
        tag.decompose()

    body = soup.body.get_text(separator="\n")

    lines = [line.strip() for line in body.splitlines() if line.strip()]
    visible_text = "\n".join(lines)

    return visible_text




@server.tool()
def get_user_resume_detail(user_resume_path:str):
    """
    This tool extract the content of the uploaded resume 
    Args:
        user_resume_path : Path of the uploaded resume 
    Return:
          dict containing the details of resume 
    """
    
    reader = PdfReader(user_resume_path)
    page = reader.pages
    extract_text = []
    for content in page:
        extract_text.append(content.extract_text())
    return extract_text 


@server.tool()
def get_keywords_according_to_job_role(job_description:str , job_role:str):
    """
    Retrieve relevant keywords for a resume based on the given job role and job description using a web search.
    This tool constructs a search query aiming to find the keywords commonly required in resumes 
    for a specific job role and job description. It uses the SerpAPIWrapper to perform a Google search 
    with specified parameters for region (India) and language (English), then returns the search results.

    Args:
        job_description (str): The description of the job position.
        job_role (str): The specific job role for which keywords are to be identified.

    Returns:
        str: Search engine results containing relevant keywords for resume optimization.
    """
    google_search = "What are the keyword requied in resume for job role {job_role} and Job description {job_description}"
    
    params = {
    "gl": "in",
    "hl": "en",
    }

    search = SerpAPIWrapper(params=params)
    answer = search.run(google_search)
    return answer


@server.tool()
def get_personal_website(personal_website_url: str):
    """
    Extracts and returns the main content text from the given personal website URL.

    Args:
        personal_website_url (str): The URL of the personal website to extract content from.

    Returns:
        str: The extracted textual content from the personal website.
    """
    
    extracted_text = read_the_paper_website_url(personal_website_url)

    return extracted_text

@server.tool()
def get_project_suggestions_by_job(job_description: str, job_role: str):
    """
    Suggest relevant project ideas based on the given job role and job description using a web search.
    This function constructs a search query to find common portfolio or resume project ideas
    for a specific job role and job description. It uses the SerpAPIWrapper (or another search API)
    configured for region (India) and language (English), then returns the result for integration or display.

    Args:
        job_description (str): The description of the job position.
        job_role (str): The specific job role for which project suggestions are required.

    Returns:
        str: Search engine results with recommended project ideas relevant to the input.
    """
    google_search = (
        f"best portfolio project ideas for {job_role} based on job description: {job_description}"
    )
    params = {
        "gl": "in",
        "hl": "en",
    }
    search = SerpAPIWrapper(params=params)
    answer = search.run(google_search)
    return answer


@server.tool()
def github_scrapper(username: str):
    """
    Fetches GitHub repositories and their README contents for the specified user.

    Args:
        username (str): The GitHub username to scrape repositories from.

    Returns:
        dict: A dictionary with the key "github" containing the list of repositories and their README data.
    """    
    content = {
        "github": fetch_github_projects_with_readmes(username),
    }

    return content

print(fetch_github_projects_with_readmes("Aryan-coder-student"))