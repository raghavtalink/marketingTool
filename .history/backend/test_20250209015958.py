import requests
from bs4 import BeautifulSoup
import time

class FixedWebScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        self.search_url = "https://duckduckgo.com/html/"

    def ddg_search(self, query):
        """Updated DuckDuckGo search with current selectors"""
        params = {
            'q': query,
            'kl': 'wt-wt',
            'kp': '-2',
            'ia': 'web'
        }

        try:
            # First get the token
            sess = requests.Session()
            sess.headers.update(self.headers)
            res = sess.post(self.search_url, data=params)
            res.raise_for_status()

            soup = BeautifulSoup(res.text, 'html.parser')
            results = []
            
            # Updated CSS selectors for 2023
            for result in soup.select('.results .result'):
                link = result.select_one('.result__a')
                if link:
                    url = link.get('href')
                    if url and url.startswith('//'):
                        url = f'https:{url}'
                    results.append(url)
            
            return [url for url in results if url][:3]  # Return top 3 results

        except Exception as e:
            print(f"Search failed: {e}")
            return []

    def improved_scrape(self, url):
        """Enhanced scraping with better content extraction"""
        try:
            time.sleep(1)  # Respectful delay
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code != 200:
                return None

            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove unwanted elements
            for tag in ['script', 'style', 'nav', 'footer', 'header', 'form', 'iframe']:
                for element in soup(tag):
                    element.decompose()

            # Focus on main content areas
            main_content = soup.find(['main', 'article']) or soup.body
            text = ' '.join(main_content.stripped_strings)
            
            # Clean up text
            text = ' '.join(text.split()[:800])  # Keep first 800 words
            return text

        except Exception as e:
            print(f"Scraping error: {e}")
            return None

def enhanced_search_flow(query, account_id, auth_token):
    """Complete verified search flow"""
    scraper = FixedWebScraper()
    
    print(f"🔍 Searching for: {query}")
    search_results = scraper.ddg_search(query)
    
    if not search_results:
        print("⚠️ No search results found. Trying alternative approach...")
        return "Could not find current information. Please check official sources."
    
    print(f"🌐 Found {len(search_results)} results. Scraping content...")
    context = []
    
    for idx, url in enumerate(search_results, 1):
        print(f"  {idx}. Scraping: {url}")
        if content := scraper.improved_scrape(url):
            context.append(f"From {url}:\n{content[:1500]}...")
    
    if not context:
        return "Could not retrieve any web content. Try another query."
    
    try:
        response = requests.post(
            f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/meta/llama-3-8b-instruct",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a sports analyst. Use this context:\n" + "\n\n".join(context)
                    },
                    {"role": "user", "content": query}
                ]
            },
            timeout=20
        )
        
        return response.json()['result']['response']
    
    except Exception as e:
        return f"API Error: {str(e)}"

# Test with current credentials
if __name__ == "__main__":
    ACCOUNT_ID = "4825492e4a93a826f5d32b94a692795f"
    AUTH_TOKEN = "Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D"
    
    query = "When is the next India vs Pakistan cricket match in CT2025?"
    response = enhanced_search_flow(query, ACCOUNT_ID, AUTH_TOKEN)
    
    print("\n" + "="*40)
    print("🏏 FINAL RESPONSE:")
    print(response)