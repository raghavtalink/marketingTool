import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus
import json

def web_enabled_chatbot(user_query, search_enabled=False):
    """
    A chatbot that can search the web and use Cloudflare's AI API to process responses
    """
    
    def search_web(query):
        """
        Search DuckDuckGo and extract relevant information
        """
        search_url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        try:
            response = requests.get(search_url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract search results
            results = []
            for result in soup.find_all('div', {'class': 'result__body'})[:5]:  # Increased to top 5 results
                title = result.find('a', {'class': 'result__a'})
                snippet = result.find('a', {'class': 'result__snippet'})
                
                if title and snippet:
                    results.append({
                        'title': title.text.strip(),
                        'snippet': snippet.text.strip()
                    })
            
            # Format results with clear structure
            combined_info = "Based on web search results:\n\n"
            for r in results:
                combined_info += f"• {r['title']}\n{r['snippet']}\n\n"
            return combined_info
        
        except Exception as e:
            print(f"Search error: {e}")
            return ""

    # Get web information if search is enabled
    web_info = ""
    if search_enabled:
        web_info = search_web(user_query)
    
    # Enhanced system prompt to better utilize web information
    system_prompt = """You are a helpful assistant that provides accurate and up-to-date information. 
    When web search results are available, use them as your primary source of information and cite them in your response. 
    If the web results contain specific dates, numbers, or facts, make sure to include them in your response."""
    
    # Prepare the message for Cloudflare AI
    messages = [
        {
            "role": "system",
            "content": system_prompt + ("\n\nHere is the latest information from web search:\n" + web_info if web_info else "")
        },
        {
            "role": "user",
            "content": user_query
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
            # Parse and verify the response
            ai_response = response.json()
            
            # If AI response seems uncertain but we have web info, append the web info
            if "has not been announced" in ai_response['result']['response'].lower() and web_info:
                additional_info = "\n\nHowever, according to recent web searches: " + web_info
                ai_response['result']['response'] += additional_info
            
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