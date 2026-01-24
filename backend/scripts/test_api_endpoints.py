import requests
from datetime import datetime
from typing import Dict, Any
import json

BASE_URL = "http://localhost:8080"
# BASE_URL = "https://api.yaralex.com"
TEST_USER = {
    "email": f"mat.ghzi.1@gmail.com",
    "username": f"MattGhazi",
    "password": "NewTest123!@#",
    "first_name": "Test",
    "last_name": "User",
    "role": "player"  #player  creator
}

# Store test data
test_data: Dict[str, Any] = {
    "verification_code": None,
    "access_token": None,
    "refresh_token": None,
    "user_id": None,
    "invalid_token": "invalid.jwt.token",
    "expired_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzQyYTk2NGIzZTY5MzQ4YzEyNzRkZTciLCJleHAiOjE2MDAwMDAwMDB9.invalid"
}

def print_test_result(test_name: str, status_code: int, expected_status: int, response_body: Any):
    """Helper function to print test results in a consistent format"""
    success = "✅ PASS" if status_code == expected_status else "❌ FAIL"
    print(f"\n{success} {test_name}")
    print(f"Expected: {expected_status}, Got: {status_code}")
    if isinstance(response_body, dict):
        print(f"Response: {json.dumps(response_body, indent=2)}")
    else:
        print(f"Response: {response_body}")

# ==================== SIGNUP TESTS ====================

def test_signup_success():
    """Test successful user registration"""
    resp = requests.post(f"{BASE_URL}/public/auth/sign-up/", json=TEST_USER)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Signup - Success", resp.status_code, 200, response_body)
    
    if resp.status_code == 200:
        test_data["user_id"] = response_body["data"]["user"]["id"]
        # Note: verification_code is not returned in response for security

def test_signup_errors():
    """Test signup error scenarios"""
    
    # Test duplicate email
    resp = requests.post(f"{BASE_URL}/public/auth/sign-up/", json=TEST_USER)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Signup - Duplicate Email", resp.status_code, 409, response_body)
    
    # Test invalid email format
    invalid_user = TEST_USER.copy()
    invalid_user["email"] = "invalid-email"
    resp = requests.post(f"{BASE_URL}/public/auth/sign-up/", json=invalid_user)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Signup - Invalid Email", resp.status_code, 422, response_body)
    
    # Test weak password
    weak_password_user = TEST_USER.copy()
    weak_password_user["email"] = "test2@example.com"
    weak_password_user["username"] = "testuser2"
    weak_password_user["password"] = "123"
    resp = requests.post(f"{BASE_URL}/public/auth/sign-up/", json=weak_password_user)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Signup - Weak Password", resp.status_code, 422, response_body)
    
    # Test missing required fields
    incomplete_user = {"email": "test3@example.com"}
    resp = requests.post(f"{BASE_URL}/public/auth/sign-up/", json=incomplete_user)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Signup - Missing Fields", resp.status_code, 422, response_body)
    
    # Test invalid role
    invalid_role_user = TEST_USER.copy()
    invalid_role_user["email"] = "test4@example.com"
    invalid_role_user["username"] = "testuser4"
    invalid_role_user["role"] = "invalid_role"
    resp = requests.post(f"{BASE_URL}/public/auth/sign-up/", json=invalid_role_user)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Signup - Invalid Role", resp.status_code, 422, response_body)

# ==================== EMAIL VERIFICATION TESTS ====================

def test_verify_email_success():
    """Test successful email verification"""
    resp = requests.post(f"{BASE_URL}/public/auth/verify-email/", json={
        "email": TEST_USER["email"],
        "verification_code": test_data["verification_code"],
        "role": TEST_USER["role"]
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Verify Email - Success", resp.status_code, 200, response_body)
    
    if resp.status_code == 200:
        test_data["access_token"] = response_body["data"]["token"]["access_token"]
        test_data["refresh_token"] = response_body["data"]["token"]["refresh_token"]

def test_verify_email_errors():
    """Test email verification error scenarios"""
    
    # Test invalid verification code
    resp = requests.post(f"{BASE_URL}/public/auth/verify-email/", json={
        "email": TEST_USER["email"],
        "verification_code": "000000"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Verify Email - Invalid Code", resp.status_code, 401, response_body)
    
    # Test user not found
    resp = requests.post(f"{BASE_URL}/public/auth/verify-email/", json={
        "email": "nonexistent@example.com",
        "verification_code": "123456"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Verify Email - User Not Found", resp.status_code, 404, response_body)
    
    # Test missing verification code
    resp = requests.post(f"{BASE_URL}/public/auth/verify-email/", json={
        "email": TEST_USER["email"]
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Verify Email - Missing Code", resp.status_code, 422, response_body)
    
    # Test invalid email format
    resp = requests.post(f"{BASE_URL}/public/auth/verify-email/", json={
        "email": "invalid-email",
        "verification_code": "123456"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Verify Email - Invalid Email Format", resp.status_code, 422, response_body)

# ==================== RESEND VERIFICATION TESTS ====================

def test_resend_verification_success():
    """Test successful resend verification"""
    resp = requests.post(f"{BASE_URL}/public/auth/resend-verification/", json={
        "email": TEST_USER["email"]
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Resend Verification - Success", resp.status_code, 200, response_body)

def test_resend_verification_errors():
    """Test resend verification error scenarios"""
    
    # Test user not found
    resp = requests.post(f"{BASE_URL}/public/auth/resend-verification/", json={
        "email": "nonexistent@example.com"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Resend Verification - User Not Found", resp.status_code, 404, response_body)
    
    # Test invalid email format
    resp = requests.post(f"{BASE_URL}/public/auth/resend-verification/", json={
        "email": "invalid-email"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Resend Verification - Invalid Email", resp.status_code, 422, response_body)
    
    # Test missing email
    resp = requests.post(f"{BASE_URL}/public/auth/resend-verification/", json={})
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Resend Verification - Missing Email", resp.status_code, 422, response_body)

# ==================== SIGNIN TESTS ====================

def test_signin_success():
    """Test successful sign in"""
    resp = requests.post(f"{BASE_URL}/public/auth/sign-in/", json={
        "username_or_email": TEST_USER["email"],
        "password": TEST_USER["password"],
        "role": TEST_USER["role"],
        "remember_me": False
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Sign In - Success", resp.status_code, 200, response_body)
    
    if resp.status_code == 200:
        test_data["access_token"] = response_body["data"]["token"]["access_token"]
        test_data["refresh_token"] = response_body["data"]["token"]["refresh_token"]

def test_signin_errors():
    """Test sign in error scenarios"""
    
    # Test user not found
    resp = requests.post(f"{BASE_URL}/public/auth/sign-in/", json={
        "username_or_email": "nonexistent@example.com",
        "password": "password123"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Sign In - User Not Found", resp.status_code, 404, response_body)
    
    # Test invalid password
    resp = requests.post(f"{BASE_URL}/public/auth/sign-in/", json={
        "username_or_email": TEST_USER["email"],
        "password": "wrongpassword"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Sign In - Invalid Password", resp.status_code, 401, response_body)
    
    # Test missing credentials
    resp = requests.post(f"{BASE_URL}/public/auth/sign-in/", json={
        "username_or_email": TEST_USER["email"]
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Sign In - Missing Password", resp.status_code, 422, response_body)
    
    # Test empty credentials
    resp = requests.post(f"{BASE_URL}/public/auth/sign-in/", json={})
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Sign In - Empty Credentials", resp.status_code, 422, response_body)

# ==================== REFRESH TOKEN TESTS ====================

def test_refresh_token_success():
    """Test successful token refresh"""
    resp = requests.post(f"{BASE_URL}/public/auth/refresh-token/", json={
        "refresh_token": test_data["refresh_token"]
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Refresh Token - Success", resp.status_code, 200, response_body)
    
    if resp.status_code == 200:
        test_data["access_token"] = response_body["data"]["token"]["access_token"]

def test_refresh_token_errors():
    """Test refresh token error scenarios"""
    
    # Test invalid refresh token
    resp = requests.post(f"{BASE_URL}/public/auth/refresh-token/", json={
        "refresh_token": test_data["invalid_token"]
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Refresh Token - Invalid Token", resp.status_code, 401, response_body)
    
    # Test missing refresh token
    resp = requests.post(f"{BASE_URL}/public/auth/refresh-token/", json={})
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Refresh Token - Missing Token", resp.status_code, 422, response_body)
    
    # Test expired refresh token
    resp = requests.post(f"{BASE_URL}/public/auth/refresh-token/", json={
        "refresh_token": test_data["expired_token"]
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Refresh Token - Expired Token", resp.status_code, 401, response_body)

# ==================== GET CURRENT USER TESTS ====================

def test_get_current_user_success():
    """Test successful get current user"""
    headers = {"Authorization": f"Bearer {test_data['access_token']}"}
    resp = requests.get(f"{BASE_URL}/public/auth/me/", headers=headers)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Get Current User - Success", resp.status_code, 200, response_body)

def test_get_current_user_errors():
    """Test get current user error scenarios"""
    
    # Test missing authorization header
    resp = requests.get(f"{BASE_URL}/public/auth/me/")
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Get Current User - Missing Auth", resp.status_code, 401, response_body)
    
    # Test invalid access token
    headers = {"Authorization": f"Bearer {test_data['invalid_token']}"}
    resp = requests.get(f"{BASE_URL}/public/auth/me/", headers=headers)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Get Current User - Invalid Token", resp.status_code, 401, response_body)
    
    # Test malformed authorization header
    headers = {"Authorization": f"InvalidScheme {test_data['access_token']}"}
    resp = requests.get(f"{BASE_URL}/public/auth/me/", headers=headers)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Get Current User - Invalid Auth Scheme", resp.status_code, 401, response_body)
    
    # Test expired access token
    headers = {"Authorization": f"Bearer {test_data['expired_token']}"}
    resp = requests.get(f"{BASE_URL}/public/auth/me/", headers=headers)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Get Current User - Expired Token", resp.status_code, 401, response_body)

# ==================== UPDATE CURRENT USER TESTS ====================

def test_update_current_user_success():
    """Test successful update current user"""
    headers = {"Authorization": f"Bearer {test_data['access_token']}"}
    update_data = {
        "email": TEST_USER["email"],
        "username": TEST_USER["username"],
        "first_name": "Updated First",
        "last_name": "Updated Last",
        "bio": "This is my updated bio",
        "avatar_url": "https://example.com/updated-avatar.jpg",
        "role": "player",
        "provider": "local",
        "is_email_verified": True
    }
    resp = requests.patch(f"{BASE_URL}/public/auth/me/", headers=headers, json=update_data)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Update Current User - Success", resp.status_code, 200, response_body)

def test_update_current_user_errors():
    """Test update current user error scenarios"""
    
    # Test missing authorization header
    update_data = {"first_name": "Updated"}
    resp = requests.patch(f"{BASE_URL}/public/auth/me/", json=update_data)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Update Current User - Missing Auth", resp.status_code, 401, response_body)
    
    # Test invalid access token
    headers = {"Authorization": f"Bearer {test_data['invalid_token']}"}
    resp = requests.patch(f"{BASE_URL}/public/auth/me/", headers=headers, json=update_data)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Update Current User - Invalid Token", resp.status_code, 401, response_body)
    
    # Test invalid email format in update
    headers = {"Authorization": f"Bearer {test_data['access_token']}"}
    invalid_update = {
        "email": "invalid-email",
        "username": TEST_USER["username"],
        "first_name": "Updated"
    }
    resp = requests.patch(f"{BASE_URL}/public/auth/me/", headers=headers, json=invalid_update)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Update Current User - Invalid Email", resp.status_code, 422, response_body)

# ==================== PASSWORD RESET TESTS ====================

def test_send_password_reset_success():
    """Test successful send password reset"""
    resp = requests.post(f"{BASE_URL}/public/auth/send-password-reset_code/", json={
        "username_or_email": TEST_USER["email"]
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Send Password Reset - Success", resp.status_code, 200, response_body)

def test_send_password_reset_errors():
    """Test send password reset error scenarios"""
    
    # Test user not found
    resp = requests.post(f"{BASE_URL}/public/auth/send-password-reset_code/", json={
        "username_or_email": "nonexistent@example.com"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Send Password Reset - User Not Found", resp.status_code, 404, response_body)
    
    # Test invalid email format
    resp = requests.post(f"{BASE_URL}/public/auth/send-password-reset_code/", json={
        "username_or_email": "invalid-email"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Send Password Reset - Invalid Email", resp.status_code, 422, response_body)
    
    # Test missing email
    resp = requests.post(f"{BASE_URL}/public/auth/send-password-reset_code/", json={})
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Send Password Reset - Missing Email", resp.status_code, 422, response_body)

def test_update_password_success():
    """Test successful password update"""
    # Use a known verification code (in real scenario, this would come from email)
    test_data["verification_code"] = "123456"  
    resp = requests.post(f"{BASE_URL}/public/auth/update-password/", json={
        "username_or_email": TEST_USER["email"],
        "verification_code": test_data["verification_code"],
        "password": "NewPassword123!"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Update Password - Success", resp.status_code, 200, response_body)
    
    if resp.status_code == 200:
        TEST_USER["password"] = "NewPassword123!"

def test_update_password_errors():
    """Test update password error scenarios"""
    
    # Test invalid verification code
    resp = requests.post(f"{BASE_URL}/public/auth/update-password/", json={
        "username_or_email": TEST_USER["email"],
        "verification_code": "000000",
        "password": "NewPassword123!"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Update Password - Invalid Code", resp.status_code, 400, response_body)
    
    # Test user not found
    resp = requests.post(f"{BASE_URL}/public/auth/update-password/", json={
        "username_or_email": "nonexistent@example.com",
        "verification_code": "123456",
        "password": "NewPassword123!"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Update Password - User Not Found", resp.status_code, 404, response_body)
    
    # Test weak password
    resp = requests.post(f"{BASE_URL}/public/auth/update-password/", json={
        "username_or_email": TEST_USER["email"],
        "verification_code": "123456",
        "password": "123"
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Update Password - Weak Password", resp.status_code, 422, response_body)
    
    # Test missing fields
    resp = requests.post(f"{BASE_URL}/public/auth/update-password/", json={
        "username_or_email": TEST_USER["email"]
    })
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Update Password - Missing Fields", resp.status_code, 422, response_body)

# ==================== LOGOUT TESTS ====================

def test_logout_success():
    """Test successful logout"""
    headers = {"Authorization": f"Bearer {test_data['access_token']}"}
    resp = requests.post(f"{BASE_URL}/public/auth/logout/", headers=headers)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Logout - Success", resp.status_code, 200, response_body)

def test_logout_errors():
    """Test logout error scenarios"""
    
    # Test missing authorization header
    resp = requests.post(f"{BASE_URL}/public/auth/logout/")
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Logout - Missing Auth", resp.status_code, 401, response_body)
    
    # Test invalid access token
    headers = {"Authorization": f"Bearer {test_data['invalid_token']}"}
    resp = requests.post(f"{BASE_URL}/public/auth/logout/", headers=headers)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Logout - Invalid Token", resp.status_code, 401, response_body)
    
    # Test expired access token
    headers = {"Authorization": f"Bearer {test_data['expired_token']}"}
    resp = requests.post(f"{BASE_URL}/public/auth/logout/", headers=headers)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Logout - Expired Token", resp.status_code, 401, response_body)

# ==================== GOOGLE TOKEN TESTS ====================

credential = {
    "clientId": "940538258951-mepajb01hrgf29h74ppv62k0bkub3qnf.apps.googleusercontent.com",
    "client_id": "940538258951-mepajb01hrgf29h74ppv62k0bkub3qnf.apps.googleusercontent.com",
    "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjBkOGE2NzM5OWU3ODgyYWNhZTdkN2Y2OGIyMjgwMjU2YTc5NmE1ODIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5NDA1MzgyNTg5NTEtbWVwYWpiMDFocmdmMjloNzRwcHY2MmswYmt1YjNxbmYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5NDA1MzgyNTg5NTEtbWVwYWpiMDFocmdmMjloNzRwcHY2MmswYmt1YjNxbmYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTU4NTU4NTczMzA4NDY1OTk4NzAiLCJlbWFpbCI6Im1qcjExNTU4OEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmJmIjoxNzQ5NzI4MDA2LCJuYW1lIjoibWogciIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLbldEejEtU0RhWmNsX2RVMDJvYWNoZGRlRmFjOVF3UFVxYzhJWXI4NFJnZm9BVDZXcz1zOTYtYyIsImdpdmVuX25hbWUiOiJtaiIsImZhbWlseV9uYW1lIjoiciIsImlhdCI6MTc0OTcyODMwNiwiZXhwIjoxNzQ5NzMxOTA2LCJqdGkiOiI1MTQyYzk3MjE0OTQwOWY5ZjA2Nzc0YmNhMjY3ZDhmNGU4OWZmZmVlIn0.LjEgWpQUNyiOMtyAnXzsca_-8GwQStTK-cEtsUcqIM7JIEaV2BLbi9upfTmBFvJ39722ExnAN_jOLnK6OqHeiWmCkbk9UNXMxrJBD97oysxi83YHD5stz09G7VwTd9F0unkTCOkYVz9T8aACbpm02gNB6WioEx_rFaqh9l68cyCtTFlEP7ZBw2uUAGPjCchH-u4XzJD36B8UorHMhJdsrQp32S28TjDfGle8esOX7TFULBpLEc-oSHCtgmF7S3DOPxxuodHessF5yC-iP30Oio_PGA4Z9bqCHfMvgN6lbnnlEepvcyEvAeZb5zKLs4-k6qigrLHkbJvQV7mzzQM_wA",
    "select_by": "btn"
}

def test_google_token_success():
    """Test successful Google token verification and user creation/login"""
    # Separate google_auth and role as expected by the endpoint
    request_data = {
        "google_auth": {
            "client_id": credential["client_id"],
            "credential": credential["credential"]
        },
        "role": "player"  # Default role for testing
    }
    
    # Log the request payload
    print("Request Payload:", request_data)
    
    resp = requests.post(f"{BASE_URL}/public/auth/google-token", json=request_data)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Google Token - Success", resp.status_code, 200, response_body)

    if resp.status_code == 200:
        test_data["access_token"] = response_body["data"]["token"]["access_token"]
        test_data["refresh_token"] = response_body["data"]["token"]["refresh_token"]
        test_data["user_id"] = response_body["data"]["user"]["id"]
        test_data["email"] = response_body["data"]["user"]["email"]
        test_data["username"] = response_body["data"]["user"]["username"]

def test_google_token_errors():
    """Test Google token verification error scenarios"""
    # Test invalid Google token
    invalid_google_auth_data = {
        "google_auth": {
            "client_id": credential["client_id"],
            "credential": "invalid_google_id_token"
        },
        "role": "player"
    }
    resp = requests.post(f"{BASE_URL}/public/auth/google-token", json=invalid_google_auth_data)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Google Token - Invalid Token", resp.status_code, 401, response_body)

    # Test missing Google token
    missing_google_auth_data = {
        "google_auth": {
            "client_id": credential["client_id"]
            # Missing credential
        },
        "role": "player"
    }
    resp = requests.post(f"{BASE_URL}/public/auth/google-token", json=missing_google_auth_data)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Google Token - Missing Token", resp.status_code, 422, response_body)
    
    # Test invalid role
    invalid_role_data = {
        "google_auth": {
            "client_id": credential["client_id"],
            "credential": credential["credential"]
        },
        "role": "invalid_role"
    }
    resp = requests.post(f"{BASE_URL}/public/auth/google-token", json=invalid_role_data)
    response_body = resp.json() if resp.headers.get("content-type") == "application/json" else resp.text
    print_test_result("Google Token - Invalid Role", resp.status_code, 422, response_body)

# ==================== MAIN TEST RUNNER ====================

def run_happy_path_tests():
    """Run all success scenario tests"""
    print("\n🟢 === RUNNING HAPPY PATH TESTS ===")
    test_signup_success()
    test_data["verification_code"] = "024603"  # Would come from email in real scenario
    test_verify_email_success()
    test_resend_verification_success()
    test_signin_success()
    test_refresh_token_success()
    test_get_current_user_success()
    test_update_current_user_success()
    test_send_password_reset_success()
    test_update_password_success()
    test_logout_success()
    test_google_token_success()

def run_error_tests():
    """Run all error scenario tests"""
    print("\n🔴 === RUNNING ERROR SCENARIO TESTS ===")
    test_signup_errors()

    test_verify_email_errors()
    test_resend_verification_errors()
    test_signin_errors()
    test_refresh_token_errors()
    test_get_current_user_errors()
    test_update_current_user_errors()
    test_send_password_reset_errors()
    test_update_password_errors()
    test_logout_errors()
    test_google_token_errors()

def run_all_tests():
    """Run comprehensive test suite covering both success and error scenarios"""
    print("🚀 === STARTING COMPREHENSIVE AUTH API TEST SUITE ===")
    print(f"Testing against: {BASE_URL}")
    print(f"Test user: {TEST_USER['email']}")
    
    # Run happy path tests first
    run_happy_path_tests()
    
    # Run error scenario tests
    run_error_tests()
    
    print("\n🏁 === COMPREHENSIVE AUTH API TEST SUITE COMPLETED ===")
    print("Review the results above to identify any failing tests.")

if __name__ == "__main__":
    run_all_tests() 