import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus
import json

def web_enabled_chatbot(user_query, search_enabled=False):
    """
    A chatbot that can search the web and use Cloudflare's AI API to process responses
    
    Parameters:
    user_query (str): The user's question or prompt
    search_enabled (bool): Whether to perform web search before AI processing
    """
    
    def search_web(query):
        """
        Search DuckDuckGo and extract relevant information
        """
        # Using DuckDuckGo's HTML endpoint to avoid API requirements
        search_url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        try:
            response = requests.get(search_url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract search results
            results = []
            for result in soup.find_all('div', {'class': 'result__body'})[:3]:  # Get top 3 results
                title = result.find('a', {'class': 'result__a'})
                snippet = result.find('a', {'class': 'result__snippet'})
                
                if title and snippet:
                    results.append({
                        'title': title.text.strip(),
                        'snippet': snippet.text.strip()
                    })
            
            # Combine results into a single string
            combined_info = " ".join([f"{r['title']}: {r['snippet']}" for r in results])
            return combined_info
        
        except Exception as e:
            print(f"Search error: {e}")
            return ""

    # Get web information if search is enabled
    web_info = ""
    if search_enabled:
        web_info = search_web(user_query)
    
    # Prepare the message for Cloudflare AI
    messages = [
        {
            "role": "system",
            "content": "You are a friendly assistant that helps answer questions. " + 
                      ("Here is some relevant information from the web: " + web_info if web_info else "")
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
            return response.json()
        else:
            return f"Error: API request failed with status code {response.status_code}"
            
    except Exception as e:
        return f"Error calling Cloudflare AI: {e}"

# Example usage
if __name__ == "__main__":
    # Example query about cricket match
    query = "When is the next India vs Pakistan cricket match in CT2025?"
    response = web_enabled_chatbot(query, search_enabled=True)
    print(response)