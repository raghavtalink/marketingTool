import requests
from bs4 import BeautifulSoup
import time

class DebuggableWebScraper:
    def __init__(self):
        self.debug_info = {}
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def ddg_search_with_debug(self, query):
        """Search DuckDuckGo with detailed debugging"""
        self.debug_info['search_stage'] = {
            'query': query,
            'success': False,
            'results': [],
            'error': None
        }

        try:
            start_time = time.time()
            response = requests.get(
                'https://html.duckduckgo.com/html/',
                params={'q': query, 'kl': 'wt-wt'},
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            results = []
            
            for result in soup.select('.web-result'):
                link = result.select_one('.result__url')
                if link:
                    url = link['href']
                    if url.startswith('//'):
                        url = f'https:{url}'
                    results.append(url)
                
            self.debug_info['search_stage'].update({
                'success': True,
                'results': results,
                'response_time': round(time.time() - start_time, 2),
                'status_code': response.status_code
            })
            
            return results
            
        except Exception as e:
            self.debug_info['search_stage']['error'] = str(e)
            return []

    def scrape_with_validation(self, url):
        """Scrape website with validation checks"""
        scrape_info = {
            'url': url,
            'success': False,
            'content': None,
            'error': None,
            'status_code': None,
            'content_length': 0
        }

        try:
            start_time = time.time()
            response = requests.get(url, headers=self.headers, timeout=15)
            scrape_info['status_code'] = response.status_code
            scrape_info['response_time'] = round(time.time() - start_time, 2)

            if response.status_code != 200:
                scrape_info['error'] = f'HTTP Error {response.status_code}'
                return None

            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Clean content
            for element in soup(["script", "style", "nav", "footer", "header"]):
                element.decompose()
                
            main_content = soup.find('main') or soup.find('article') or soup.body
            text_content = ' '.join(main_content.stripped_strings)[:2000]
            
            scrape_info.update({
                'success': True,
                'content': text_content,
                'content_length': len(text_content)
            })
            
            return text_content
            
        except Exception as e:
            scrape_info['error'] = str(e)
            return None
            
        finally:
            if 'scraping_steps' not in self.debug_info:
                self.debug_info['scraping_steps'] = []
            self.debug_info['scraping_steps'].append(scrape_info)

def enhanced_ai_query(user_query, account_id, auth_token):
    """Full process with validation and debugging"""
    debug_info = {}
    scraper = DebuggableWebScraper()
    
    print(f"🔍 Starting search for: {user_query}")
    search_results = scraper.ddg_search_with_debug(user_query)
    debug_info.update(scraper.debug_info)
    
    print(f"🌐 Found {len(search_results)} search results")
    web_content = []
    
    for idx, url in enumerate(search_results[:3], 1):
        print(f"🔄 Scraping result {idx}/{len(search_results[:3])}: {url}")
        if content := scraper.scrape_with_validation(url):
            web_content.append(f"From {url}:\n{content}")
    
    context = "\n\n".join(web_content) or "No web context available"
    debug_info['final_context'] = {
        'context_length': len(context),
        'context_preview': context[:500] + '...' if len(context) > 500 else context
    }
    
    print("\n📨 Sending to AI with context...")
    try:
        response = requests.post(
            f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/meta/llama-3-8b-instruct",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "messages": [
                    {
                        "role": "system",
                        "content": f"You are a sports analyst. Answer ONLY using this context:\n{context}"
                    },
                    {"role": "user", "content": user_query}
                ]
            },
            timeout=20
        )
        response_data = response.json()
        
        debug_info['ai_response'] = {
            'status': 'success' if response.ok else 'error',
            'status_code': response.status_code,
            'response_preview': response_data.get('result', {}).get('response', '')[:200],
            'used_context': 'context' in response_data.get('result', {}).get('response', '').lower()
        }
        
        return {
            'final_response': response_data.get('result', {}).get('response', ''),
            'debug_info': debug_info
        }
        
    except Exception as e:
        debug_info['ai_response'] = {
            'error': str(e),
            'status': 'failed'
        }
        return {
            'final_response': f"Error: {str(e)}",
            'debug_info': debug_info
        }

# Usage example
if __name__ == "__main__":
    ACCOUNT_ID = "4825492e4a93a826f5d32b94a692795f"
    AUTH_TOKEN = "Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D"
    
    query = "When is the next India vs Pakistan cricket match in CT2025?"
    result = enhanced_ai_query(query, ACCOUNT_ID, AUTH_TOKEN)
    
    print("\n" + "="*40)
    print("💻 DEBUG REPORT:")
    print(f"Search Status: {'Success' if result['debug_info']['search_stage']['success'] else 'Failed'}")
    print(f"Found URLs: {result['debug_info']['search_stage']['results']}")
    print(f"Scraping Attempts: {len(result['debug_info'].get('scraping_steps', []))}")
    
    print("\n🔗 Scraping Details:")
    for step in result['debug_info'].get('scraping_steps', []):
        print(f" - URL: {step['url']}")
        print(f"   Status: {'Success' if step['success'] else 'Failed'}")
        print(f"   Content Length: {step.get('content_length', 0)} chars")
        if step.get('error'):
            print(f"   Error: {step['error']}")
    
    print("\n📝 Context Sent to AI:")
    print(result['debug_info']['final_context']['context_preview'])
    
    print("\n🤖 AI Response Analysis:")
    print(f"Used Context: {'Yes' if result['debug_info']['ai_response'].get('used_context') else 'No'}")
    print(f"Response Preview: {result['debug_info']['ai_response'].get('response_preview', '')}")
    
    print("\n" + "="*40)
    print("🎯 FINAL RESPONSE:")
    print(result['final_response'])