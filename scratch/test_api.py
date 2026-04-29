import requests
try:
    r = requests.get('http://localhost:5000/api/dashboard')
    print(f"Status: {r.status_code}")
    print(f"Response: {r.json()}")
except Exception as e:
    print(f"Error: {e}")
