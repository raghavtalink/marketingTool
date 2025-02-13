import requests
from bs4 import BeautifulSoup
import json
import re

def search_duckduckgo(query):
    """
    Uses DuckDuckGo's HTML search to find a URL for the query,
    then scrapes that URL for some text content.
    """
    # Construct the DuckDuckGo search URL (using the HTML version)
    search_url = f"https://html.duckduckgo.com/html/?q={query}"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    try:
        response = requests.get(search_url, headers=headers)
    except Exception as e:
        return f"Error during search: {str(e)}"
    
    if response.status_code != 200:
        return "Error: Unable to retrieve search results."

    soup = BeautifulSoup(response.text, "html.parser")
    
    # Find result links (DuckDuckGo returns links with class 'result__a')
    links = soup.find_all("a", class_="result__a")
    for link in links:
        href = link.get("href")
        # DuckDuckGo often wraps the real URL in a query parameter; extract it.
        match = re.search(r"uddg=(https?://[^&]+)", href)
        if match:
            # Decode the URL
            actual_url = requests.utils.unquote(match.group(1))
            # Scrape the webpage for content.
            return scrape_website(actual_url)
    
    return "No relevant web information found."

def scrape_website(url):
    """
    Fetches the webpage at the given URL and extracts some text content.
    """
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        response = requests.get(url, headers=headers)
    except Exception as e:
        return f"Error scraping URL: {str(e)}"
    
    if response.status_code != 200:
        return "Error: Unable to retrieve webpage content."

    soup = BeautifulSoup(response.text, "html.parser")
    
    # Grab text from a few <p> tags (this may be adapted to target specific content)
    paragraphs = soup.find_all("p")
    text_content = " ".join([p.get_text() for p in paragraphs[:5]])
    return text_content.strip() if text_content.strip() else "No text content found."

def ask_cloudflare_ai(user_input, search_query=None, url=None):
    """
    Builds the prompt by optionally adding scraped web content (from a search or direct URL)
    and then calls Cloudflare's AI API.
    
    :param user_input: The primary prompt for the AI.
    :param search_query: Optional search query to scrape web info.
    :param url: Optional direct URL to scrape content from.
    :return: The JSON response from the Cloudflare API.
    """
    web_info = ""
    
    # If a search query is provided, use it to get additional info.
    if search_query:
        web_info = search_duckduckgo(search_query)
    # Alternatively, if a direct URL is provided:
    elif url:
        web_info = scrape_website(url)
    
    # Debug: Print out the scraped information so you can check if it's connected to the internet.
    print("DEBUG: Web info scraped:")
    print(web_info)
    
    # Build the payload. We’re injecting the scraped web_info into the user’s prompt.
    payload = {
        "messages": [
            {"role": "system", "content": "You are a friendly assistant that helps write stories."},
            {"role": "user", "content": f"{user_input} {web_info}"}
        ]
    }
    
    # Cloudflare AI endpoint and headers (your authorization token is included)
    cloudflare_url = ("https://api.cloudflare.com/client/v4/accounts/"
                      "4825492e4a93a826f5d32b94a692795f/ai/run/@cf/meta/llama-3-8b-instruct")
    headers = {
        "Authorization": "Bearer Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(cloudflare_url, headers=headers, data=json.dumps(payload))
        return response.json()
    except Exception as e:
        return {"error": f"Error calling Cloudflare AI: {str(e)}"}

# Example usage:
if __name__ == '__main__':
    # Test: Use a search query related to the next India vs Pakistan cricket match.
    user_question = "When is the next India vs Pakistan cricket match?"
    search_query = "next India vs Pakistan cricket match date"  # Test search query
    response = ask_cloudflare_ai(user_question, search_query=search_query)
    
    # Print the complete response from Cloudflare's AI.
    print(json.dumps(response, indent=2))
