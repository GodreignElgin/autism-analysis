import requests
import time
import sys

def wait_for_server(url, timeout=10):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return True
        except requests.ConnectionError:
            time.sleep(1)
    return False

print("Waiting for server to start...")
if wait_for_server("http://127.0.0.1:8000/"):
    print("Server is up!")
    try:
        response = requests.get("http://127.0.0.1:8000/")
        print(f"Root endpoint response: {response.json()}")
        
        # Test docs endpoint
        docs_response = requests.get("http://127.0.0.1:8000/docs")
        print(f"Docs endpoint status: {docs_response.status_code}")
        
        if docs_response.status_code == 200:
            print("Swagger UI is accessible.")
        else:
            print("Swagger UI is NOT accessible.")
            
    except Exception as e:
        print(f"Error testing endpoints: {e}")
else:
    print("Server failed to start within timeout.")
    sys.exit(1)
