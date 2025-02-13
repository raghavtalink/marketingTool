import requests
from bs4 import BeautifulSoup
import time
import random

class RobustSearchEngine:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://google.com',
            'DNT': '1'
        }
        self.search_engines = [
            self.duckduckgo_search,
            self.bing_search,
            self.yahoo_search
        ]

    def search(self, query):
        """Try multiple search engines until results are found"""
        for engine in random.sample(self.search_engines, len(self.search_engines)):
            try:
                results = engine(query)
                if results:
                    return results
            except Exception as e:
                print(f"Search error in {engine.__name__}: {e}")
        return []

    def duckduckgo_search(self, query):
        """Updated DuckDuckGo search with current selectors"""
        session = requests.Session()
        session.headers.update(self.headers)
        
        # First request to get cookies
        session.get("https://duckduckgo.com/", timeout=10)
        
        # Main search request
        params = {
            'q': query,
            'kl': 'wt-wt',
            'kp': '-2',
            'ia': 'web'
        }
        
        response = session.post(
            "https://html.duckduckgo.com/html/",
            data=params,
            timeout=15
        )
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        results = []
        
        # Updated selector for 2023 layout
        for result in soup.select('[data-testid="result"]'):
            link = result.select_one('[data-testid="result-extras-url-link"]')
            if link:
                url = link.get('href')
                if url and url.startswith('//'):
                    url = f'https:{url}'
                results.append(url)
        
        return list(dict.fromkeys(results))[:3]  # Remove duplicates

    def bing_search(self, query):
        """Fallback Bing search"""
        response = requests.get(
            "https://www.bing.com/search",
            params={'q': query},
            headers=self.headers,
            timeout=10
        )
        soup = BeautifulSoup(response.text, 'html.parser')
        return [
            a['href'] for a in soup.select('.b_algo h2 a')[:3]
            if 'href' in a.attrs
        ]

    def yahoo_search(self, query):
        """Fallback Yahoo search"""
        response = requests.get(
            "https://search.yahoo.com/search",
            params={'p': query},
            headers=self.headers,
            timeout=10
        )
        soup = BeautifulSoup(response.text, 'html.parser')
        return [
            a['href'] for a in soup.select('.compTitle h3 a')[:3]
            if 'href' in a.attrs
        ]

def get_ai_response_with_context(account_id, auth_token, query, context):
    """Get AI response with proper context handling"""
    messages = [
        {
            "role": "system",
            "content": "You are a sports analyst. Use this verified information:"
        },
        {
            "role": "system",
            "content": context or "No current information found"
        },
        {
            "role": "user",
            "content": query
        }
    ]
    
    try:
        response = requests.post(
            f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/meta/llama-3-8b-instruct",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"messages": messages},
            timeout=25
        )
        return response.json()['result']['response']
    except Exception as e:
        return f"API Error: {str(e)}"

def enhanced_cricket_search(query, account_id, auth_token):
    """Complete search and analysis flow"""
    print(f"🔍 Starting enhanced search for: {query}")
    
    # Initialize search engine with multiple fallbacks
    searcher = RobustSearchEngine()
    results = searcher.search(query)
    
    if not results:
        print("⚠️ No results found across all search engines")
        return "Could not find recent information. Please check official ICC sources."
    
    print(f"🌐 Found {len(results)} relevant URLs. Scraping content...")
    
    context = []
    for url in results:
        try:
            response = requests.get(url, headers=searcher.headers, timeout=15)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Clean content
            for tag in ['script', 'style', 'nav', 'footer', 'header']:
                for element in soup(tag):
                    element.decompose()
            
            # Focus on article content
            content = soup.find('article') or soup.find('main') or soup.body
            text = ' '.join(content.stripped_strings)[:2000]
            
            context.append(f"From {url}:\n{text}")
            time.sleep(1)  # Respectful delay
            
        except Exception as e:
            print(f"⚠️ Scraping error for {url}: {str(e)[:50]}...")
    
    if not context:
        return "Could not retrieve any valid information from sources."
    
    return get_ai_response_with_context(
        account_id,
        auth_token,
        query,
        "\n\n".join(context)
    )

# Test with current credentials
if __name__ == "__main__":
    ACCOUNT_ID = "4825492e4a93a826f5d32b94a692795f"
    AUTH_TOKEN = "Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D"
    
    query = "When is the next India vs Pakistan cricket ?"
    response = enhanced_cricket_search(query, ACCOUNT_ID, AUTH_TOKEN)
    
    print("\n" + "="*40)
    print("🏏 FINAL RESPONSE:")
    print(response)