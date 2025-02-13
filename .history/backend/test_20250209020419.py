import requests
from bs4 import BeautifulSoup
import json
import re

# Function to perform a DuckDuckGo search and extract real URLs
def search_duckduckgo(query):
    search_url = f"https://html.duckduckgo.com/html/?q={query}"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(search_url, headers=headers)
    
    if response.status_code != 200:
        return "Failed to retrieve search results."

    soup = BeautifulSoup(response.text, "html.parser")
    
    # Extract search result links
    links = soup.find_all("a", class_="result__a")
    for link in links:
        href = link.get("href")
        
        # Extract real URL using regex
        match = re.search(r"uddg=(https?[^&]+)", href)
        if match:
            actual_url = requests.utils.unquote(match.group(1))  # Decode URL
            return scrape_website(actual_url)  # Scrape the first real URL found

    return "No relevant web data found."

# Function to scrape text from a given URL
def scrape_website(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        return "Failed to retrieve webpage content."

    soup = BeautifulSoup(response.text, "html.parser")
    
    # Extract meaningful content
    paragraphs = soup.find_all("p")
    text_content = " ".join([p.get_text() for p in paragraphs[:5]])  # Extract first 5 paragraphs
    
    return text_content if text_content else "No relevant information found on the page."

# Function to interact with Cloudflare AI
def ask_cloudflare_ai(user_input, search_query=None, url=None):
    web_info = ""

    # Perform search and scrape data if required
    if search_query:
        web_info = search_duckduckgo(search_query)
    elif url:
        web_info = scrape_website(url)

    # Cloudflare AI request
    cloudflare_url = "https://api.cloudflare.com/client/v4/accounts/4825492e4a93a826f5d32b94a692795f/ai/run/@cf/meta/llama-3-8b-instruct"
    headers = {
        "Authorization": "Bearer Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D",
        "Content-Type": "application/json"
    }

    payload = {
        "messages": [
            {"role": "system", "content": "You are a friendly assistant that helps write stories"},
            {"role": "user", "content": f"{user_input} Here is some recent information I found: {web_info}"}
        ]
    }

    response = requests.post(cloudflare_url, headers=headers, data=json.dumps(payload))
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to fetch response from Cloudflare AI"}

# Example usage
user_question = "When is the next India vs Pakistan match in CT2025?"
search_query = "India vs Pakistan Champions Trophy 2025 match date"
response = ask_cloudflare_ai(user_question, search_query=search_query)
print(response)
