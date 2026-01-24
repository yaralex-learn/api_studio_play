from datetime import datetime, timedelta, timezone
from jose import jwt
from jose.exceptions import ExpiredSignatureError

def test_jwt_token():
    """
    Test the entire JWT token lifecycle in one function:
    1. Create token
    2. Verify token
    3. Test expiration
    4. Test different scenarios
    """
    print("\n=== JWT Token Lifecycle Test ===")
    
    # Settings
    JWT_SECRET_KEY = "3245346436ge435ese632g4244"
    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS = 3
    user_id = "12315464316513215"
    
    try:
        # 1. Create Token
        print("\n1. Creating Token...")
        current_time = datetime.now(timezone.utc)
        expire_time = current_time + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        
        print(f"Current UTC time: {current_time}")
        print(f"Current timestamp: {current_time.timestamp()}")
        print(f"Expiration time: {expire_time}")
        print(f"Expiration timestamp: {expire_time.timestamp()}")
        
        # Create payload
        payload = {
            "sub": user_id,
            "exp": expire_time.timestamp(),
            "iat": current_time.timestamp(),
            "type": "access"
        }
        print(f"Token payload: {payload}")
        
        # Encode token
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        print(f"Encoded token: {token}")
        
        # 2. Verify Token
        print("\n2. Verifying Token...")
        decoded = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            options={
                "verify_exp": True,
                "leeway": 10,
                "verify_iat": True
            }
        )
        print(f"Decoded payload: {decoded}")
        print("Token verified successfully!")
        
        # 3. Test Token Parts
        print("\n3. Token Structure:")
        parts = token.split('.')
        print(f"Header: {parts[0]}")
        print(f"Payload: {parts[1]}")
        print(f"Signature: {parts[2][:20]}...")
        
        # 4. Test Different Scenarios
        print("\n4. Testing Different Scenarios:")
        
        # Test cases with different times
        scenarios = [
            ("Current time", current_time),
            ("1 hour ago", current_time - timedelta(hours=1)),
            ("1 hour from now", current_time + timedelta(hours=1)),
            ("2 hours from now", current_time + timedelta(hours=2)),
            ("4 hours from now", current_time + timedelta(hours=4))
        ]
        
        for scenario_name, test_time in scenarios:
            print(f"\nTesting {scenario_name}:")
            try:
                # Create test token with this time
                test_payload = {
                    "sub": user_id,
                    "exp": (test_time + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)).timestamp(),
                    "iat": test_time.timestamp(),
                    "type": "access"
                }
                test_token = jwt.encode(test_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
                
                # Try to decode
                decoded = jwt.decode(
                    test_token,
                    JWT_SECRET_KEY,
                    algorithms=[JWT_ALGORITHM],
                    options={"verify_exp": True, "leeway": 10}
                )
                print(f"✓ Token valid at {scenario_name}")
                print(f"  Expires at: {datetime.fromtimestamp(decoded['exp'], timezone.utc)}")
                print(f"  Time until expiration: {datetime.fromtimestamp(decoded['exp'], timezone.utc) - datetime.now(timezone.utc)}")
                
            except ExpiredSignatureError:
                print(f"✗ Token expired at {scenario_name}")
                print(f"  Current time: {datetime.now(timezone.utc)}")
                print(f"  Token expiration: {datetime.fromtimestamp(test_payload['exp'], timezone.utc)}")
            except Exception as e:
                print(f"✗ Error at {scenario_name}: {str(e)}")
        
        # 5. Test Invalid Scenarios
        print("\n5. Testing Invalid Scenarios:")
        
        # Test with wrong secret key
        try:
            wrong_token = jwt.encode(payload, "wrong_secret_key", algorithm=JWT_ALGORITHM)
            jwt.decode(wrong_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            print("✗ Should have failed with wrong secret key")
        except Exception as e:
            print(f"✓ Correctly failed with wrong secret key: {str(e)}")
        
        # Test with expired token
        expired_payload = payload.copy()
        expired_payload["exp"] = (current_time - timedelta(hours=1)).timestamp()
        try:
            expired_token = jwt.encode(expired_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
            jwt.decode(expired_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            print("✗ Should have failed with expired token")
        except ExpiredSignatureError:
            print("✓ Correctly failed with expired token")
        
        # Test with wrong token type
        wrong_type_payload = payload.copy()
        wrong_type_payload["type"] = "refresh"
        try:
            wrong_type_token = jwt.encode(wrong_type_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
            jwt.decode(wrong_type_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            print("✗ Should have failed with wrong token type")
        except Exception as e:
            print(f"✓ Correctly failed with wrong token type: {str(e)}")
        
        print("\n=== Token Lifecycle Test Completed Successfully ===\n")
        return True
        
    except Exception as e:
        print(f"\n=== Token Test Failed ===")
        print(f"Error type: {type(e)}")
        print(f"Error message: {str(e)}")
        print("=== End Token Test ===\n")
        return False

if __name__ == "__main__":
    test_jwt_token() 