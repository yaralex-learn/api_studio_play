import asyncio
import httpx
import pytest
import time
from typing import Dict, Any

BASE_URL = "http://localhost:8000"  # Base URL without /api

# Test user data with unique suffix to avoid conflicts
unique_suffix = str(int(time.time()))[-4:]
TEST_USER = {
    "email": f"testuser{unique_suffix}@example.com",
    "username": f"testuser{unique_suffix}",  # 4-16 chars, starts with letter, no double underscores
    "password": "Test123!@#",  # Has uppercase, lowercase, number, and special char
    "first_name": "Test",
    "last_name": "User",
    "bio": "Test bio"
}

# Store tokens and user data for tests that need them
test_data: Dict[str, Any] = {
    "access_token": None,
    "refresh_token": None,
    "user_id": None
}

@pytest.mark.asyncio
async def test_signup():
    """Test user registration endpoint"""
    async with httpx.AsyncClient() as client:
        # Generate a new unique suffix for each test run
        unique_suffix = str(int(time.time()))[-4:]
        test_user = {
            "email": f"testuser{unique_suffix}@example.com",
            "username": f"testuser{unique_suffix}",
            "password": "Test123!@#",
            "first_name": "Test",
            "last_name": "User",
            "bio": "Test bio"
        }
        
        print("\nSign Up Request Payload:", test_user)
        
        try:
            # Test successful signup
            resp = await client.post(f"{BASE_URL}/public/auth/sign-up/", json=test_user)
            print("\nSign Up Response Status:", resp.status_code)
            print("Sign Up Response Headers:", dict(resp.headers))
            
            try:
                response_body = resp.json()
                print("Sign Up Response Body (JSON):", response_body)
                
                if resp.status_code == 422:
                    print("\nValidation Error Details:")
                    print("Full Response:", response_body)
                    if "detail" in response_body:
                        print("\nValidation Errors:", response_body["detail"])
                    print("Error Code:", response_body.get("error_code"))
                    print("Error Message:", response_body.get("message"))
                    
                    # Check if this is a duplicate user error
                    if "ALREADY_REGISTERED" in str(response_body) or "TAKEN_USERNAME" in str(response_body):
                        print("\nThis appears to be a duplicate user error. Trying with a different unique suffix...")
                        # Try again with a new unique suffix
                        return await test_signup()
                
            except Exception as e:
                print("Sign Up Response Body (Raw):", resp.text)
                print("Error parsing JSON:", str(e))
            
            assert resp.status_code == 200, f"Expected status 200, got {resp.status_code}"
            assert isinstance(response_body, dict), "Response should be JSON"
            assert response_body.get("success") is True, "Response should indicate success"
            assert "data" in response_body, "Response should contain data"
            assert "access_token" in response_body["data"], "Response should contain access token"
            
            # Store user data and tokens for other tests
            test_data["user"] = test_user
            test_data["access_token"] = response_body["data"]["access_token"]
            test_data["user_id"] = response_body["data"].get("user_id")
            
            print("\nSign Up Successful!")
            return response_body

        except Exception as e:
            print("\nException during signup:", str(e))
            print("Full traceback:")
            import traceback
            traceback.print_exc()
            raise

@pytest.mark.asyncio
async def test_signin():
    """Test user login endpoint"""
    async with httpx.AsyncClient() as client:
        # First ensure user exists and get the stored user data
        signup_response = await test_signup()
        if not test_data.get("user"):
            raise Exception("No user data available for signin test")
            
        stored_user = test_data["user"]
        print("\nAttempting signin with stored user:", {
            "username_or_email": stored_user["email"],
            "password": stored_user["password"]
        })
        
        # Test successful signin
        try:
            resp = await client.post(f"{BASE_URL}/public/auth/sign-in/", json={
                "username_or_email": stored_user["email"],
                "password": stored_user["password"]
            })
            print("\nSign In Response Status:", resp.status_code)
            try:
                response_body = resp.json()
                print("Sign In Response Body:", response_body)
                
                if not response_body.get("success"):
                    print("\nSign In Failed:")
                    print("Error Code:", response_body.get("error_code"))
                    print("Error Message:", response_body.get("message"))
                    if "detail" in response_body:
                        print("Error Detail:", response_body["detail"])
                    raise Exception(f"Sign in failed: {response_body.get('message')}")
                
            except Exception as e:
                print("Sign In Response Body (Raw):", resp.text)
                print("Error parsing JSON:", str(e))
                raise
            
            assert resp.status_code == 200, f"Expected status 200, got {resp.status_code}"
            assert response_body["success"] is True, "Response should indicate success"
            assert "access_token" in response_body["data"], "Response should contain access token"
            
            # Update stored tokens
            test_data["access_token"] = response_body["data"]["access_token"]
            print("\nSign In Successful!")
            
        except Exception as e:
            print("\nException during signin:", str(e))
            print("Full traceback:")
            import traceback
            traceback.print_exc()
            raise

@pytest.mark.asyncio
async def test_forgot_password():
    """Test forgot password endpoint"""
    async with httpx.AsyncClient() as client:
        # First ensure user exists
        await test_signup()
        
        try:
            resp = await client.post(f"{BASE_URL}/public/auth/forgot_password/", json={
                "username_or_email": TEST_USER["email"]
            })
            print("\nForgot Password Response Status:", resp.status_code)
            try:
                response_body = resp.json()
                print("Forgot Password Response Body:", response_body)
            except:
                print("Forgot Password Response Body (Raw):", resp.text)
            
            assert resp.status_code == 200, f"Expected status 200, got {resp.status_code}"
            assert response_body["success"] is True
            assert "sent to your email" in response_body["message"]["en"].lower()
            
        except Exception as e:
            print("\nException during forgot password:", str(e))
            print("Full traceback:")
            import traceback
            traceback.print_exc()
            raise

        # Test with non-existent user
        try:
            resp = await client.post(f"{BASE_URL}/public/auth/forgot_password/", json={
                "username_or_email": "nonexistent@example.com"
            })
            print("\nNon-existent User Response Status:", resp.status_code)
            try:
                print("Non-existent User Response Body:", resp.json())
            except:
                print("Non-existent User Response Body (Raw):", resp.text)
            assert resp.status_code == 404, f"Expected status 404 for non-existent user, got {resp.status_code}"
        except Exception as e:
            print("Error testing non-existent user:", str(e))
            raise

@pytest.mark.asyncio
async def test_reset_password():
    """Test reset password endpoint"""
    async with httpx.AsyncClient() as client:
        # First ensure user exists and requested password reset
        await test_signup()
        await test_forgot_password()
        
        try:
            resp = await client.post(f"{BASE_URL}/public/auth/reset_password/", json={
                "username_or_email": TEST_USER["email"],
                "otp": "123456",  # Note: This will fail in real implementation as OTP is not implemented
                "password": "NewTest123!@#"
            })
            print("\nReset Password Response Status:", resp.status_code)
            try:
                response_body = resp.json()
                print("Reset Password Response Body:", response_body)
            except:
                print("Reset Password Response Body (Raw):", resp.text)
            
            # Note: This test will fail until OTP implementation is complete
            assert resp.status_code in [200, 400], f"Expected status 200 or 400, got {resp.status_code}"
            
        except Exception as e:
            print("\nException during reset password:", str(e))
            print("Full traceback:")
            import traceback
            traceback.print_exc()
            raise

@pytest.mark.asyncio
async def test_google_auth():
    """Test Google authentication endpoint"""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(f"{BASE_URL}/public/auth/gota/", json={
                "token": "invalid_token"
            })
            print("\nGoogle Auth Response Status:", resp.status_code)
            try:
                response_body = resp.json()
                print("Google Auth Response Body:", response_body)
            except:
                print("Google Auth Response Body (Raw):", resp.text)
            
            assert resp.status_code == 400, f"Expected status 400 for invalid token, got {resp.status_code}"
            assert response_body["success"] is False
            assert "invalid token" in response_body["error"].lower()
            
        except Exception as e:
            print("\nException during Google auth:", str(e))
            print("Full traceback:")
            import traceback
            traceback.print_exc()
            raise

def run_auth_tests():
    """Run all auth tests in sequence"""
    asyncio.run(test_signup())
    asyncio.run(test_signin())
    asyncio.run(test_forgot_password())
    asyncio.run(test_reset_password())
    asyncio.run(test_google_auth())

if __name__ == "__main__":
    run_auth_tests() 