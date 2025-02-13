import requests
from bs4 import BeautifulSoup
import json

# Function to search DuckDuckGo and scrape results
def search_duckduckgo(query):
    search_url = f"https://html.duckduckgo.com/html/?q={query}"
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    # Get top search result link
    links = soup.find_all("a", class_="result__a")
    if links:
        first_link = "https://duckduckgo.com" + links[0]["href"]
        return scrape_website(first_link)  # Scrape the first result
    return "No relevant web data found."

# Function to scrape a given URL
def scrape_website(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    # Extract text content from <p> tags
    paragraphs = soup.find_all("p")
    text_content = " ".join([p.get_text() for p in paragraphs[:5]])  # Get first 5 paragraphs
    return text_content if text_content else "No relevant information found on the page."

# Function to interact with Cloudflare AI
def ask_cloudflare_ai(user_input, search_query=None, url=None):
    web_info = ""
    
    # If a search query is provided, fetch web info
    if search_query:
        web_info = search_duckduckgo(search_query)
    
    # If a direct URL is provided, scrape it
    elif url:
        web_info = scrape_website(url)

    # Cloudflare API request
    cloudflare_url = "https://api.cloudflare.com/client/v4/accounts/4825492e4a93a826f5d32b94a692795f/ai/run/@cf/meta/llama-3-8b-instruct"
    headers = {
        "Authorization": "Bearer Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D",
        "Content-Type": "application/json"
    }

    payload = {
        "messages": [
            {"role": "system", "content": "You are a friendly assistant that helps write stories"},
            {"role": "user", "content": f"{user_input} {web_info}"}
        ]
    }

    response = requests.post(cloudflare_url, headers=headers, data=json.dumps(payload))
    return response.json()

# Example usage
user_question = "When is the next India vs Pakistan match in CT2025?"
search_query = "next India vs Pakistan Champions Trophy 2025 match date"
response = ask_cloudflare_ai(user_question, search_query=search_query)
print(response)
