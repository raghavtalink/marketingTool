import requests
import json

# Configurations
GOOGLE_API_KEY = "AIzaSyCyX75raXw968VIaPGdbfuzp1NnWsHKKYY"
CX = "628284219f29c4910"  # Replace with your Google Custom Search CX ID
CLOUDFLARE_API_URL = "https://api.cloudflare.com/client/v4/accounts/4825492e4a93a826f5d32b94a692795f/ai/run/@cf/meta/llama-3-8b-instruct"
CLOUDFLARE_AUTH_TOKEN = "Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D"

def google_search(query):
    """Fetch search results from Google Custom Search JSON API"""
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={GOOGLE_API_KEY}&cx={CX}"
    response = requests.get(url)
    data = response.json()

    # Extract top search results
    results = []
    if "items" in data:
        for item in data["items"][:3]:  # Top 3 results
            results.append(f"{item['title']}: {item['snippet']}")
    
    return "\n".join(results) if results else "No relevant results found."

def call_llama3(query, web_info):
    """Pass query with web info to Cloudflare Meta Llama-3"""
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messages": [
            {"role": "system", "content": "You are a helpful assistant with internet access."},
            {"role": "user", "content": f"{query}\n\nWeb Data: {web_info}"}
        ]
    }

    response = requests.post(CLOUDFLARE_API_URL, headers=headers, data=json.dumps(payload))
    
    return response.json()

def search_and_respond(query):
    """Main function: search web & generate response"""
    print(f"Searching Google for: {query}...")
    web_data = google_search(query)
    
    print("\nPassing data to Cloudflare's Llama 3...")
    response = call_llama3(query, web_data)
    
    print("\nLlama 3 Response:")
    print(response.get("choices", [{}])[0].get("message", {}).get("content", "No response generated."))

# Example usage
query = "ind vs pak cricket mat in 2025"
search_and_respond(query)