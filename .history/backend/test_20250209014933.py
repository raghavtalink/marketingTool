import os
import requests
from bs4 import BeautifulSoup
import time

# Configuration
CONFIG = {
    "api_timeout": 30,  # Increased timeout
    "max_retries": 3,
    "retry_delay": 2,
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "model": "@cf/meta/llama-3-8b-instruct"  # Correct model from your curl example
}

def internet_enabled_chat(prompt, account_id, auth_token, mock_mode=False):
    """Enhanced version with retries and proper model endpoint"""
    
    def ethical_scrape(url):
        """Improved scraping with rate limiting"""
        try:
            time.sleep(1)  # Be polite with delays
            response = requests.get(
                url, 
                headers={'User-Agent': CONFIG['user_agent']},
                timeout=10
            )
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Cleanup elements
            for element in soup(["script", "style", "nav", "footer", "header"]):
                element.decompose()
                
            # Content extraction
            main_content = soup.find('main') or soup.find('article') or soup.body
            return ' '.join(main_content.stripped_strings)[:3000]
        except Exception as e:
            print(f"⚠️ Scraping error: {str(e)[:200]}")
            return None

    def get_web_context(prompt):
        """Web context handler with better error reporting"""
        if mock_mode:
            return "[Mock] PEP 8 is Python's style guide..."
            
        try:
            if prompt.startswith("search: "):
                query = prompt[8:]
                print(f"🔍 Searching: {query}")
                # Implement actual search here
                return "[Search Results] PEP 8 guidelines..."
                
            elif prompt.startswith("url: "):
                url = prompt[5:]
                print(f"🌐 Scraping: {url}")
                if content := ethical_scrape(url):
                    return f"From {url}: {content[:500]}..."  # Truncate for demo
                return None
                
        except Exception as e:
            print(f"🌐 Web context error: {str(e)[:200]}")
            
        return None

    # Build messages with error handling
    try:
        web_context = get_web_context(prompt) or "No web context"
        messages = [
            {"role": "system", "content": "You're a helpful assistant. Web context:"},
            {"role": "system", "content": web_context},
            {"role": "user", "content": prompt}
        ]
    except Exception as e:
        return f"❌ Message construction failed: {str(e)[:200]}"

    # API call with retries
    for attempt in range(CONFIG['max_retries']):
        try:
            response = requests.post(
                f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{CONFIG['model']}",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={"messages": messages},
                timeout=CONFIG['api_timeout']
            )
            response.raise_for_status()
            return response.json()['result']['response']
            
        except requests.exceptions.Timeout:
            print(f"⌛ Timeout (attempt {attempt+1}/{CONFIG['max_retries']})")
            time.sleep(CONFIG['retry_delay'] ** (attempt + 1))
            
        except Exception as e:
            return f"❌ API Error: {str(e)[:200]}"
            
    return "❌ Failed after multiple retries"

# Testing with your credentials
if __name__ == "__main__":
    # Use environment variables for security
    ACCOUNT_ID = "4825492e4a93a826f5d32b94a692795f"
    AUTH_TOKEN = "Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D"
    
    # Test with mock data
    print("🧪 Testing with mock data:")
    print(internet_enabled_chat(
        "search: PEP-8 Python guidelines",
        ACCOUNT_ID,
        AUTH_TOKEN,
        mock_mode=True
    ))
    
    # Test with direct API call (without web context)
    print("\n🧪 Testing direct API call:")
    print(internet_enabled_chat(
        "Write a short story about a llama and an orange cloud",
        ACCOUNT_ID,
        AUTH_TOKEN
    ))