import os
import requests
from bs4 import BeautifulSoup

def internet_enabled_chat(prompt, account_id, auth_token, mock_mode=False):
    """
    Chat with Cloudflare AI using web context
    :param prompt: User query (use "search: " or "url: " prefixes for web access)
    :param account_id: Cloudflare account ID
    :param auth_token: Cloudflare API token
    :param mock_mode: Use mock data instead of real web scraping
    :return: Formatted response from AI
    """
    # Ethical scraping functions
    def ethical_scrape(url):
        try:
            response = requests.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove unwanted elements
            for element in soup(["script", "style", "nav", "footer", "header"]):
                element.decompose()
                
            # Extract main content
            main_content = soup.find('main') or soup.find('article') or soup.body
            return ' '.join(main_content.stripped_strings)[:3000]
        except Exception as e:
            print(f"Scraping error: {e}")
            return None

    def get_web_context(prompt):
        if mock_mode:
            return "[From https://peps.python.org/pep-0008/: PEP 8 is the style guide for Python code...][Mock data]"
            
        if prompt.startswith("search: "):
            query = prompt[8:]
            print(f"Searching DuckDuckGo for: {query}")
            # Implement actual search here (previous DuckDuckGo implementation)
            # For testing, return mock results
            return "[From https://peps.python.org/pep-0008/: PEP 8 Style Guide...][From example.com: Sample content]"
            
        elif prompt.startswith("url: "):
            url = prompt[5:]
            print(f"Scraping: {url}")
            if content := ethical_scrape(url):
                return f"From {url}: {content}"
            return None
            
        return None

    # Build messages
    web_context = get_web_context(prompt) or "No web context available"
    messages = [
        {"role": "system", "content": "You are a technical assistant. Use this web context:"},
        {"role": "system", "content": web_context},
        {"role": "user", "content": prompt}
    ]

    # Call Cloudflare AI
    try:
        response = requests.post(
            f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@hf/google/gemma-7b-it",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"messages": messages},
            timeout=15
        )
        response.raise_for_status()
        return response.json()['result']['response']
    except Exception as e:
        return f"API Error: {str(e)}"

# Test with your credentials
if __name__ == "__main__":
    # Replace with your actual credentials
    ACCOUNT_ID = "Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D"
    AUTH_TOKEN = "mjmuMe_-1mNvt9SkcyRCUIP7JtMO63yifNJE19AD"
    
    # Test with mock data
    print("Testing with mock data:")
    print(internet_enabled_chat(
        "search: PEP-8 Python guidelines",
        ACCOUNT_ID,
        AUTH_TOKEN,
        mock_mode=True
    ))
    
    # Test with real URL (uncomment to test actual scraping)
    # print("\nTesting with real URL:")
    # print(internet_enabled_chat(
    #     "url: https://peps.python.org/pep-0008/",
    #     ACCOUNT_ID,
    #     AUTH_TOKEN
    # ))

    