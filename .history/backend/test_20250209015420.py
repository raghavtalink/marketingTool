import requests
from bs4 import BeautifulSoup
import time
from collections import deque
from urllib.parse import urlparse

class WebContextManager:
    def __init__(self, max_cache_size=10, cache_timeout=3600):
        self.cache = deque(maxlen=max_cache_size)
        self.cache_timeout = cache_timeout
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def ddg_search(self, query, num_results=3):
        """DuckDuckGo search with HTML scraping"""
        try:
            response = requests.get(
                'https://html.duckduckgo.com/html/',
                params={'q': query, 'kl': 'wt-wt'},
                headers=self.headers,
                timeout=10
            )
            soup = BeautifulSoup(response.text, 'html.parser')
            
            results = []
            for result in soup.select('.web-result'):
                link = result.select_one('.result__url')
                if link and len(results) < num_results:
                    url = link['href']
                    if url.startswith('//'):
                        url = f'https:{url}'
                    results.append(url)
            return results
        except Exception as e:
            print(f"Search error: {e}")
            return []

    def scrape_content(self, url):
        """Ethical content scraping with cache"""
        # Check cache first
        for entry in self.cache:
            if entry['url'] == url and (time.time() - entry['timestamp']) < self.cache_timeout:
                return entry['content']
        
        try:
            # Respect robots.txt
            parsed = urlparse(url)
            robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
            robots_resp = requests.get(robots_url, timeout=5)
            
            if robots_resp.status_code == 200 and 'disallow: /' in robots_resp.text.lower():
                print(f"Robots.txt blocks scraping for {url}")
                return None

            # Polite delay
            time.sleep(1)
            
            response = requests.get(url, headers=self.headers, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Clean content
            for element in soup(["script", "style", "nav", "footer", "header"]):
                element.decompose()
                
            main_content = soup.find('main') or soup.find('article') or soup.body
            text_content = ' '.join(main_content.stripped_strings)[:2000]  # Limit content
            
            # Update cache
            self.cache.append({
                'url': url,
                'content': text_content,
                'timestamp': time.time()
            })
            
            return text_content
        except Exception as e:
            print(f"Scraping error: {e}")
            return None

def get_ai_response(prompt, web_context, account_id, auth_token):
    """Get AI response with web context"""
    messages = [
        {
            "role": "system",
            "content": "You are an informed assistant. Use this web context to answer accurately:"
        },
        {
            "role": "system",
            "content": web_context or "No web context available"
        },
        {
            "role": "user",
            "content": prompt
        }
    ]
    
    try:
        response = requests.post(
            f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/meta/llama-3-8b-instruct",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"messages": messages},
            timeout=20
        )
        response.raise_for_status()
        return response.json()['result']['response']
    except Exception as e:
        return f"API Error: {str(e)}"

# Example usage
if __name__ == "__main__":
    ACCOUNT_ID = "4825492e4a93a826f5d32b94a692795f"
    AUTH_TOKEN = "Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D"
    
    web_manager = WebContextManager()
    
    # User query example
    user_query = "When is the next India vs Pakistan cricket match in CT2025?"
    
    # Step 1: Web search
    search_results = web_manager.ddg_search(user_query)
    
    # Step 2: Scrape and aggregate content
    web_content = []
    for url in search_results[:3]:  # Limit to top 3 results
        if content := web_manager.scrape_content(url):
            web_content.append(f"From {url}:\n{content}")
    
    context = "\n\n".join(web_content) or "No relevant web content found"
    
    # Step 3: Get AI response
    response = get_ai_response(
        prompt=user_query,
        web_context=context,
        account_id=ACCOUNT_ID,
        auth_token=AUTH_TOKEN
    )
    
    print("Final Response:")
    print(response)