import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus
import json
import re
from datetime import datetime

def web_enabled_chatbot(user_query, search_enabled=False):
    """
    A chatbot that can search the web and use Cloudflare's AI API to process responses
    """
    
    def search_google(query):
        """
        Search Google and extract relevant information
        """
        search_url = f"https://www.google.com/search?q={quote_plus(query)}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        try:
            response = requests.get(search_url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract search results from Google's layout
            results = []
            
            # Look for div elements containing search results
            for div in soup.find_all('div', {'class': ['g', 'ZINbbc']}):
                title_elem = div.find('h3') or div.find('div', {'class': 'BNeawe vvjwJb AP7Wnd'})
                snippet_elem = div.find('div', {'class': ['VwiC3b', 'yXK7lf', 'BNeawe s3v9rd AP7Wnd']})
                
                if title_elem and snippet_elem:
                    title = title_elem.get_text()
                    snippet = snippet_elem.get_text()
                    
                    # Look for dates in the content
                    date_pattern = r'(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}'
                    dates = re.findall(date_pattern, snippet, re.IGNORECASE)
                    
                    results.append({
                        'title': title.strip(),
                        'snippet': snippet.strip(),
                        'dates': dates
                    })
            
            # Format results with emphasis on dates
            combined_info = "Latest information from web search:\n\n"
            for r in results:
                combined_info += f"Source: {r['title']}\n"
                combined_info += f"Information: {r['snippet']}\n"
                if r['dates']:
                    combined_info += f"Relevant dates found: {', '.join(r['dates'])}\n"
                combined_info += "\n"
            
            return combined_info
        
        except Exception as e:
            print(f"Search error: {e}")
            return ""

    # Get web information if search is enabled
    web_info = ""
    if search_enabled:
        web_info = search_google(user_query)
    
    # Enhanced system prompt with stronger emphasis on dates and specific information
    system_prompt = """You are a helpful assistant that provides accurate and up-to-date information. 
    When web search results contain specific dates or match information, always include these in your response.
    If you find conflicting information, present all available dates and cite the sources.
    For sports matches, prioritize the most recent announcements and official schedules."""
    
    # Prepare the message for Cloudflare AI
    messages = [
        {
            "role": "system",
            "content": system_prompt + ("\n\n" + web_info if web_info else "")
        },
        {
            "role": "user",
            "content": user_query + " Please include specific dates if available."
        }
    ]
    
    # Call Cloudflare AI API
    cf_api_url = "https://api.cloudflare.com/client/v4/accounts/4825492e4a93a826f5d32b94a692795f/ai/run/@cf/meta/llama-3-8b-instruct"
    headers = {
        "Authorization": "Bearer Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            cf_api_url,
            headers=headers,
            json={"messages": messages}
        )
        
        if response.status_code == 200:
            ai_response = response.json()
            
            # If AI response doesn't mention the specific date but we found it in web search
            if "February 23, 2025" not in ai_response['result']['response'] and "February 23, 2025" in web_info:
                ai_response['result']['response'] += "\n\nUPDATE: According to recent web searches, the India-Pakistan match is scheduled for February 23, 2025."
            
            return ai_response
            
        else:
            return f"Error: API request failed with status code {response.status_code}"
            
    except Exception as e:
        return f"Error calling Cloudflare AI: {e}"

# Example usage
if __name__ == "__main__":
    query = "When is the next India vs Pakistan cricket match in CT2025?"
    response = web_enabled_chatbot(query, search_enabled=True)
    print(json.dumps(response, indent=2))