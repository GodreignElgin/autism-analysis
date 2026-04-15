import requests
import json

# Test the chatbot API directly
BASE_URL = "http://localhost:5000"

# Step 1: Login
login_data = {
    "email": "test@example.com",
    "password": "Test123!"
}

print("Logging in...")
response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
print(f"Login Status: {response.status_code}")

if response.status_code == 200:
    token = response.json()['access_token']
    print(f"Token obtained: {token[:20]}...")
    
    # Step 2: Test chat
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    chat_data = {
        "message": "What are the early signs of autism?"
    }
    
    print("\nSending chat message...")
    response = requests.post(f"{BASE_URL}/api/chat", json=chat_data, headers=headers)
    print(f"Chat Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
else:
    print(f"Login failed: {response.text}")
