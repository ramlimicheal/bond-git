import requests
import json

BASE_URL = "http://localhost:3000/api/v1"

def test_login():
    email = "test@example.com"
    password = "password123"
    
    # Register first (to handle user exists/cleanup)
    print(f"Attempting to register {email}...")
    try:
        reg_resp = requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password,
            "name": "Test User"
        })
        print(f"Register status: {reg_resp.status_code}")
        print(f"Register response: {reg_resp.text}")
    except Exception as e:
        print(f"Register failed: {e}")

    # Login
    print(f"\nAttempting to login {email}...")
    try:
        login_resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        print(f"Login status: {login_resp.status_code}")
        print(f"Login response: {login_resp.text}")
        
        if login_resp.status_code == 200:
            token = login_resp.json().get('token')
            print(f"Login successful! Token: {token[:20]}...")
            return True
        else:
            print("Login failed!")
            return False
            
    except Exception as e:
        print(f"Login failed: {e}")
        return False

if __name__ == "__main__":
    test_login()
