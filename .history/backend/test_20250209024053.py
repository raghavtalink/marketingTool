import requests
import json
import re

# Configurations
GOOGLE_API_KEY = "AIzaSyCyX75raXw968VIaPGdbfuzp1NnWsHKKYY"
CX = "628284219f29c4910"  # Your Google Custom Search CX ID
CLOUDFLARE_API_URL = "https://api.cloudflare.com/client/v4/accounts/4825492e4a93a826f5d32b94a692795f/ai/run/@cf/meta/llama-3-8b-instruct"
CLOUDFLARE_AUTH_TOKEN = "Ohl4qSmuTR6mBwopFjGiZjI6bLmKKV9C-dfrRg9D"

def google_search(query):
    """Fetch search results from Google Custom Search JSON API"""
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={GOOGLE_API_KEY}&cx={CX}"
    response = requests.get(url)

    if response.status_code != 200:
        return f"Error fetching results: {response.text}"

    data = response.json()
    
    # Extract top search results
    results = []
    if "items" in data:
        for item in data["items"][:3]:  # Fetch top 3 results
            results.append(item["snippet"])

    combined_text = " ".join(results)
    
    # Extract date using regex (matches formats like "25 June 2025", "June 25, 2025", "2025-06-25")
    match = re.search(r"\b(\d{1,2}\s\w+\s\d{4}|\w+\s\d{1,2},\s\d{4}|\d{4}-\d{2}-\d{2})\b", combined_text)
    date_info = match.group(0) if match else "Match date not found."

    structured_context = f"Extracted Date: {date_info}\n\n{combined_text}"
    
    return structured_context

def call_llama3(query, structured_context):
    """Pass query with structured web info to Cloudflare Meta Llama-3"""
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messages": [
            {"role": "system", "content": "You are an AI assistant with internet access. Use the provided data to answer queries accurately."},
            {"role": "user", "content": f"Query: {query}\n\nWeb Data:\n{structured_context}\n\nUse the above data to generate an answer."}
        ]
    }

    response = requests.post(CLOUDFLARE_API_URL, headers=headers, data=json.dumps(payload))

    if response.status_code != 200:
        return f"Error in Llama 3 API: {response.text}"
    
    data = response.json()
    
    # Debugging: Print raw API response
    print("\n🔹 RAW RESPONSE FROM LLAMA 🔹\n", json.dumps(data, indent=2))

    # ✅ Correct extraction from response JSON
    return data.get("result", {}).get("response", "No response generated.")



def search_and_respond(query):
    """Main function: search web & generate response"""
    print(f"🔎 Searching Google for: {query}...\n")
    web_data = google_search(query)
    
    print("\n🚀 Passing data to Cloudflare's Llama 3...")
    llama_response = call_llama3(query, web_data)
    
    print("\n🔹 Extracted Web Data 🔹")
    print(web_data)
    print("\n🔹 Llama 3 Response 🔹")
    print(llama_response)

# Example usage
query = "best herbal hai"
search_and_respond(query)
