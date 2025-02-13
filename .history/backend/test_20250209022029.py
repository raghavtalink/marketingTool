import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus
import json
import time
from random import choice
import logging
from datetime import datetime

class WebConnectedChatbot:
    def __init__(self, cf_api_key):
        self.cf_api_key = cf_api_key
        self.cf_api_url = "https://api.cloudflare.com/client/v4/accounts/4825492e4a93a826f5d32b94a692795f/ai/run/@cf/meta/llama-3-8b-instruct"
        self.session = requests.Session()
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
        
        # Setup console logging
        self.setup_logging()
        
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='[%(asctime)s] %(levelname)s: %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        self.logger = logging.getLogger('WebChatbot')

    def _get_random_headers(self):
        """Generate random headers for requests"""
        headers = {
            'User-Agent': choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        }
        self.logger.info(f"Generated headers: {json.dumps(headers, indent=2)}")
        return headers

    def _search_google(self, query):
        """Perform Google search with detailed logging"""
        self.logger.info(f"🔍 Starting Google search for query: '{query}'")
        
        search_url = f"https://www.google.com/search?q={quote_plus(query)}&gl=us&hl=en"
        self.logger.info(f"🌐 Constructed search URL: {search_url}")
        
        headers = self._get_random_headers()
        
        try:
            self.logger.info("📡 Sending request to Google...")
            response = self.session.get(search_url, headers=headers, timeout=10)
            
            self.logger.info(f"📥 Received response from Google. Status code: {response.status_code}")
            self.logger.info(f"Response headers: {json.dumps(dict(response.headers), indent=2)}")
            
            if response.status_code != 200:
                self.logger.error(f"❌ Failed to get search results. Status code: {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.text, 'html.parser')
            self.logger.info("🔍 Parsing search results...")
            
            search_results = []
            results = soup.find_all('div', {'class': ['g', 'tF2Cxc', 'yuRUbf']})
            
            self.logger.info(f"Found {len(results)} potential results")
            
            for idx, result in enumerate(results[:5], 1):
                self.logger.info(f"\n--- Processing Result #{idx} ---")
                
                title_elem = result.find('h3')
                if title_elem:
                    title = title_elem.get_text().strip()
                    self.logger.info(f"📑 Title found: {title}")
                else:
                    self.logger.warning("⚠️ No title found for this result")
                    continue
                
                snippet_elem = result.find('div', {'class': ['VwiC3b', 'yXK7lf']})
                if snippet_elem:
                    snippet = snippet_elem.get_text().strip()
                    self.logger.info(f"📝 Snippet found: {snippet[:100]}...")
                else:
                    self.logger.warning("⚠️ No snippet found for this result")
                    continue
                
                link_elem = result.find('a')
                link = link_elem['href'] if link_elem and 'href' in link_elem.attrs else None
                if link:
                    self.logger.info(f"🔗 URL found: {link}")
                
                search_results.append({
                    'title': title,
                    'snippet': snippet,
                    'url': link
                })
            
            self.logger.info(f"✅ Successfully collected {len(search_results)} search results")
            return search_results
            
        except Exception as e:
            self.logger.error(f"❌ Error during search: {str(e)}", exc_info=True)
            return []

    def get_response(self, user_query, search_enabled=False):
        """Get response with detailed logging"""
        self.logger.info(f"\n{'='*50}\n🤖 Starting new chat interaction\n{'='*50}")
        self.logger.info(f"📝 User query: {user_query}")
        self.logger.info(f"🔍 Search enabled: {search_enabled}")
        
        web_info = ""
        if search_enabled:
            self.logger.info("🌐 Initiating web search...")
            search_results = self._search_google(user_query)
            
            if search_results:
                web_info = "Latest information from web search:\n\n"
                for idx, result in enumerate(search_results, 1):
                    self.logger.info(f"Processing search result #{idx} for AI context")
                    web_info += f"Source {idx}: {result['title']}\n"
                    web_info += f"Information: {result['snippet']}\n"
                    if result.get('url'):
                        web_info += f"URL: {result['url']}\n"
                    web_info += "\n"
                
                self.logger.info("📚 Web information collected and formatted for AI")
                self.logger.info(f"Web info preview: {web_info[:200]}...")
            else:
                self.logger.warning("⚠️ No search results found")
        
        self.logger.info("🤖 Preparing AI request...")
        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant with access to current web information. "
                          "Please cite sources and include specific dates when available."
            },
            {
                "role": "user",
                "content": user_query
            }
        ]
        
        if web_info:
            self.logger.info("Adding web information to system message")
            messages[0]["content"] += f"\n\nHere is the current information from web search:\n{web_info}"
        
        self.logger.info("📤 Sending request to Cloudflare AI...")
        self.logger.info(f"Request messages: {json.dumps(messages, indent=2)}")
        
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
            
            self.logger.info(f"📥 Received response from Cloudflare AI. Status code: {response.status_code}")
            
            if response.status_code == 200:
                ai_response = response.json()
                self.logger.info("✅ Successfully received AI response")
                self.logger.info(f"Response preview: {str(ai_response)[:200]}...")
                return ai_response
            else:
                error_msg = f"Error: API request failed with status code {response.status_code}"
                self.logger.error(f"❌ {error_msg}")
                return error_msg
                
        except Exception as e:
            error_msg = f"Error calling Cloudflare AI: {str(e)}"
            self.logger.error(f"❌ {error_msg}", exc_info=True)
            return error_msg

# Example usage with logging
if __name__ == "__main__":
    print("\n=== Web-Connected Chatbot Test ===\n")
    
    cf_api_key = "Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D"
    chatbot = WebConnectedChatbot(cf_api_key)
    
    query = "When is the next India vs Pakistan cricket match in CT2025?"
    print(f"Testing query: {query}\n")
    
    response = chatbot.get_response(query, search_enabled=True)
    
    print("\nFinal Response from Chatbot:")
    print(json.dumps(response, indent=2))