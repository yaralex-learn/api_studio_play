#!/usr/bin/env python3
"""
Test script for channel setting endpoints
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://127.0.0.1:8080"
# BASE_URL = "https://api.yaralex.com"

SETTING_API = f"{BASE_URL}/studio/channel/setting/"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGE5YTFhNGRlN2VkYWY1NGJiYjZkMzQiLCJleHAiOjE3NTY3NTU1MzEsImlhdCI6MTc1NjcxOTUzMSwidHlwZSI6ImFjY2VzcyJ9.h5dAgYIIyZ2QmwkaEaoD7y5gKzHtgnTYiCbSJH5VEdc"


HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}

# Test data
CHANNEL_DATA = {
    "name": "Setting Test Channel",
    "description": "Channel for testing setting APIs 11",
    "primary_language": "en",
    "target_language": "es",
    "avatar_file_id": "661f14bf72b568b13257f8e8",
    "cover_image_file_id": "661f14bf72b568b13257f8e9"
}

CHANNEL_UPDATE_DATA = {
    "name": "Updated Setting Test Channel",
    "description": "Updated channel description",
    "primary_language": "en",
    "target_language": "fr",
    "avatar_file_id": "661f14bf72b568b13257f8ea",
    "cover_image_file_id": "661f14bf72b568b13257f8eb"
}

PUBLISH_DATA = {
    "channel_id": "686bbd3a6b4c59f34ad4e052",
    "published": True,
    "channel_link": "https://example.com/my-channel"
}

TIER_DATA = {
    "channel_id": "686e6c296379935cebfacc9e",
    "name": "Premium Tier",
    "price": 19.99,
    "capacity": 50,
    "billing_cycle": "Monthly",
    "features": ["HD Videos", "Live Chat", "Priority Support"]
}

TIER_UPDATE_DATA = {
    "channel_id": "686e6c296379935cebfacc9e",
    "name": "Updated Premium Tier",
    "price": 24.99,
    "capacity": 75,
    "billing_cycle": "Quarterly",
    "features": ["4K Videos", "Live Chat", "Priority Support", "1-on-1 Sessions"]
}

FREE_ACCESS_DATA = {
    "percentage": 30,
    "free_activities": ["activity_1", "activity_2"]
}

COUPON_DATA = {
    "channel_id": "686e6c296379935cebfacc9e",
    "code": "WELCOME50",
    "discount_type": "Percentage",
    "discount_value": 50,
    "max_uses": 100,
    "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat(),
    "is_active": True
}

COUPON_UPDATE_DATA = {
    "channel_id": "686e6c296379935cebfacc9e",
    "code": "WELCOME30",
    "discount_type": "Percentage", 
    "discount_value": 30,
    "max_uses": 200,
    "expires_at": (datetime.utcnow() + timedelta(days=60)).isoformat(),
    "is_active": True
}

def test_create_channel():
    """Test creating a channel"""
    print("🏗️  Testing channel creation...")
    
    response = requests.post(SETTING_API, headers=HEADERS, json=CHANNEL_DATA)
    
    if response.status_code == 200:
        data = response.json()
        channel_id = data.get("id")
        print(f"✅ Channel created! ID: {channel_id}")
        return channel_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_duplicate_channel(source_channel_id):
    """Test duplicating a channel"""
    print("📋 Testing channel duplication...")
    
    response = requests.post(
        f"{SETTING_API}{source_channel_id}/duplicate/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        data = response.json()
        duplicate_channel_id = data.get("id")
        print(f"✅ Channel duplicated! New ID: {duplicate_channel_id}")
        print(f"   Original: {source_channel_id}")
        print(f"   Duplicate: {duplicate_channel_id}")
        return duplicate_channel_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_update_channel_info(channel_id):
    """Test updating channel info"""
    print("✏️  Testing channel info update...")
    
    response = requests.put(
        f"{SETTING_API}{channel_id}/info/",
        headers=HEADERS,
        json=CHANNEL_UPDATE_DATA
    )
    
    if response.status_code == 200:
        print("✅ Channel info updated!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_publish_channel(channel_id):
    """Test publishing a channel"""
    print("📢 Testing channel publishing...")
    
    response = requests.patch(
        f"{SETTING_API}{channel_id}/publish/",
        headers=HEADERS,
        json=PUBLISH_DATA
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Channel published! Status: {data.get('published')}")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_get_publish_info(channel_id):
    """Test getting publish information"""
    print("📊 Testing get publish info...")
    
    response = requests.get(
        f"{SETTING_API}{channel_id}/publish/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Publish info retrieved! Published: {data.get('published')}")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_create_tier(channel_id):
    """Test creating a subscription tier"""
    print("💰 Testing tier creation...")
    
    tier_data = TIER_DATA.copy()
    
    response = requests.post(
        f"{SETTING_API}{channel_id}/tier/",
        headers=HEADERS,
        json=tier_data
    )
    
    if response.status_code == 200:
        data = response.json()
        tier_id = data.get("id")
        print(f"✅ Tier created! ID: {tier_id}")
        return tier_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_get_all_tiers(channel_id):
    """Test getting all tiers"""
    print("📋 Testing get all tiers...")
    
    response = requests.get(
        f"{SETTING_API}{channel_id}/tier/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Retrieved {len(data)} tiers!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_update_tier(channel_id, tier_id):
    """Test updating a tier"""
    print("✏️  Testing tier update...")
    TIER_UPDATE_DATA["channel_id"] = channel_id
    response = requests.put(
        f"{SETTING_API}{channel_id}/tier/{tier_id}/",
        headers=HEADERS,
        json=TIER_UPDATE_DATA
    )
    
    if response.status_code == 200:
        data = response.json()
        tier_id = data.get("_id")
        print(f"✅ Tier created! ID: {tier_id}")
        return tier_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_free_access_percentage(channel_id):
    """Test getting activity percentage for free access"""
    print("📊 Testing free access percentage calculation...")
    
    response = requests.get(
        f"{SETTING_API}{channel_id}/free-access/percentage/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Free access percentage calculated! Percentage: {data.get('percentage')}%")
        print(f"✅ Free access percentage calculated! Percentage: {data}")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_update_free_access(channel_id):
    """Test updating free access settings"""
    print("🆓 Testing free access update...")
    
    response = requests.put(
        f"{SETTING_API}{channel_id}/free-access/",
        headers=HEADERS,
        json=FREE_ACCESS_DATA
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Free access updated! Percentage: {data.get('percentage')}%")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_get_free_access(channel_id):
    """Test getting free access settings"""
    print("📋 Testing get free access...")
    
    response = requests.get(
        f"{SETTING_API}{channel_id}/free-access/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Free access retrieved! Percentage: {data.get('percentage')}%")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_create_coupon(channel_id):
    """Test creating a coupon"""
    print("🎟️  Testing coupon creation...")
    COUPON_DATA["channel_id"] = channel_id
    response = requests.post(
        f"{SETTING_API}{channel_id}/coupon/",
        headers=HEADERS,
        json=COUPON_DATA
    )
    
    if response.status_code == 200:
        data = response.json()
        coupon_id = data.get("id")
        print(f"✅ Coupon created! ID: {coupon_id}, Code: {data.get('code')}")
        return coupon_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_get_all_coupons(channel_id):
    """Test getting all coupons"""
    print("📋 Testing get all coupons...")
    
    response = requests.get(
        f"{SETTING_API}{channel_id}/coupon/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Retrieved {len(data)} coupons!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_update_coupon(channel_id, coupon_id):
    """Test updating a coupon"""
    print("✏️  Testing coupon update...")
    COUPON_UPDATE_DATA["channel_id"] = channel_id
    response = requests.put(
        f"{SETTING_API}{channel_id}/coupon/{coupon_id}/",
        headers=HEADERS,
        json=COUPON_UPDATE_DATA
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Coupon updated! New code: {data.get('code')}")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_delete_coupon(channel_id, coupon_id):
    """Test deleting a coupon"""
    print("🗑️  Testing coupon deletion...")
    
    response = requests.delete(
        f"{SETTING_API}{channel_id}/coupon/{coupon_id}/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        print("✅ Coupon deleted!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_delete_tier(channel_id, tier_id):
    """Test deleting a tier"""
    print("🗑️  Testing tier deletion...")
    
    response = requests.delete(
        f"{SETTING_API}{channel_id}/tier/{tier_id}/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        print("✅ Tier deleted!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def cleanup_channel(channel_id):
    """Delete test channel"""
    print("🗑️  Cleaning up test channel...")
    
    response = requests.delete(
        f"{SETTING_API}{channel_id}/info/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        print("✅ Test channel deleted!")
    else:
        print(f"❌ Cleanup failed: {response.status_code} - {response.text}")

def main():
    """Run all setting tests"""
    print("Channel Setting API Test Suite")
    print("=" * 40)
    
    # Create test channel
    channel_id = test_create_channel()
    if not channel_id:
        return
    
    # Test channel info management
    test_update_channel_info(channel_id)
    
    # Test publish functionality
    test_publish_channel(channel_id)
    test_get_publish_info(channel_id)
    
    # Test tier management
    tier_id = test_create_tier(channel_id)
    if tier_id:
        test_get_all_tiers(channel_id)
        test_update_tier(channel_id, tier_id)
        test_delete_tier(channel_id, tier_id)
    
    # Test free access management
    test_free_access_percentage(channel_id)
    test_update_free_access(channel_id)
    test_get_free_access(channel_id)
    
    # Test coupon management
    coupon_id = test_create_coupon(channel_id)
    if coupon_id:
        test_get_all_coupons(channel_id)
        test_update_coupon(channel_id, coupon_id)
        test_delete_coupon(channel_id, coupon_id)
    
    # Test channel duplication
    duplicate_channel_id = test_duplicate_channel(channel_id)
    
    # Cleanup
    cleanup = input("\nDelete test channel? (Y/n): ").strip().lower()
    if cleanup != 'n':
        cleanup_channel(channel_id)
        # Also cleanup the duplicate channel if it was created
        if duplicate_channel_id:
            cleanup_channel(duplicate_channel_id)
    else:
        print(f"💾 Test channel preserved: {channel_id}")
        if duplicate_channel_id:
            print(f"💾 Duplicate channel preserved: {duplicate_channel_id}")
    
    print("\n🏁 Setting tests completed!")

if __name__ == "__main__":
    main() 