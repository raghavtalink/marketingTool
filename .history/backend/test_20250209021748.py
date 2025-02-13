import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus, urlparse
import json
import time
from fake_useragent import UserAgent
import concurrent.futures
import re

class WebConnectedChatbot:
    def __init__(self, cf_api_key):
        self.cf_api_key = cf_api_key
        self.cf_api_url = "https://api.cloudflare.com/client/v4/accounts/4825492e4a93a826f5d32b94a692795f/ai/run/@cf/meta/llama-3-8b-instruct"
        self.session = requests.Session()
        self.ua = UserAgent()
        
    def _get_google_search_results(self, query, num_results=5):
        """
        Perform Google search and return results
        """
        search_url = f"https://www.google.com/search?q={quote_plus(query)}&num={num_results}"
        headers = {'User-Agent': self.ua.random}
        
        try:
            response = self.session.get(search_url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            search_results = []
            # Get both search results and their URLs
            for div in soup.find_all('div', class_=['g', 'tF2Cxc']):
                title_elem = div.find('h3')
                link_elem = div.find('a')
                snippet_elem = div.find('div', class_=['VwiC3b', 'yXK7lf'])
                
                if title_elem and link_elem and snippet_elem:
                    result = {
                        'title': title_elem.text,
                        'url': link_elem['href'],
                        'snippet': snippet_elem.text
                    }
                    search_results.append(result)
            
            return search_results
        except Exception as e:
            print(f"Google search error: {e}")
            return []

    def _scrape_url(self, url):
        """
        Scrape content from a specific URL
        """
        try:
            headers = {'User-Agent': self.ua.random}
            response = self.session.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get the main content
            main_content = ""
            
            # Try to find main content area
            main_tags = soup.find_all(['article', 'main', 'div'], class_=re.compile(r'(content|article|post|entry)'))
            if main_tags:
                main_content = main_tags[0].get_text(separator=' ', strip=True)
            else:
                # Fallback to body content
                main_content = soup.body.get_text(separator=' ', strip=True)
            
            # Clean up the text
            main_content = ' '.join(main_content.split())
            
            return {
                'url': url,
                'content': main_content[:2000]  # Limit content length
            }
        except Exception as e:
            print(f"URL scraping error for {url}: {e}")
            return None

    def search_and_scrape(self, query, specific_url=None):
        """
        Perform search and scraping operations
        """
        collected_info = []
        
        # If specific URL is provided, scrape it first
        if specific_url:
            url_content = self._scrape_url(specific_url)
            if url_content:
                collected_info.append(url_content)
        
        # Perform Google search
        search_results = self._get_google_search_results(query)
        
        # Scrape top search results in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            future_to_url = {
                executor.submit(self._scrape_url, result['url']): result['url']
                for result in search_results[:3]  # Limit to top 3 results
            }
            
            for future in concurrent.futures.as_completed(future_to_url):
                content = future.result()
                if content:
                    collected_info.append(content)
        
        return collected_info

    def get_response(self, user_query, search_enabled=False, specific_url=None):
        """
        Get response from Cloudflare AI with web information
        """
        web_info = ""
        if search_enabled:
            print("Searching and scraping web content...")
            collected_info = self.search_and_scrape(user_query, specific_url)
            
            if collected_info:
                web_info = "Information from web sources:\n\n"
                for info in collected_info:
                    web_info += f"Source: {info['url']}\n"
                    web_info += f"Content: {info['content']}\n\n"
        
        messages = [
            {
                "role": "system",
                "content": f"""You are a helpful assistant with access to current web information.
                Please provide accurate and up-to-date responses based on the following web data:
                {web_info if web_info else 'No web data available.'}"""
            },
            {
                "role": "user",
                "content": user_query
            }
        ]
        
        headers = {
            "Authorization": f"Bearer {self.cf_api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = self.session.post(
                self.cf_api_url,
                headers=headers,
                json={"messages": messages}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return f"Error: API request failed with status code {response.status_code}"
                
        except Exception as e:
            return f"Error calling Cloudflare AI: {e}"

# Example usage
if __name__ == "__main__":
    # Initialize the chatbot
    cf_api_key = "Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D"
    chatbot = WebConnectedChatbot(cf_api_key)
    
    # Example queries
    queries = [
        {
            "query": "When is the next India vs Pakistan cricket match in CT2025?",
            "search": True,
            "url": None
        },
        {
            "query": "What are the latest developments in AI?",
            "search": True,
            "url": "https://news.mit.edu/topic/artificial-intelligence2"  # Example specific URL
        }
    ]
    
    # Test the chatbot
    for q in queries:
        print(f"\nQuery: {q['query']}")
        response = chatbot.get_response(q['query'], search_enabled=q['search'], specific_url=q['url'])
        print(json.dumps(response, indent=2))
        time.sleep(2)  # Add delay between requests