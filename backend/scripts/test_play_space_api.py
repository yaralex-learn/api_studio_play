#!/usr/bin/env python3
"""
Test script for Play Space API endpoints - Success cases only
"""

import requests
import io

# Configuration
BASE_URL = "http://127.0.0.1:8080"
PLAY_API = f"{BASE_URL}/play/"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGE5YTFhNGRlN2VkYWY1NGJiYjZkMzQiLCJleHAiOjE3NTY2Mzk5OTEsImlhdCI6MTc1NjYwMzk5MSwidHlwZSI6ImFjY2VzcyJ9.s8oJrDzRqVNc6gUlxDmzXKbvcvdsmv0gf6NJVbx41_Y"

HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}

# Test file ID (should be a file from a subscribed channel)


def test_download_subscribed_file(TEST_FILE_ID):
    """Test downloading a file from subscribed channel"""
    print("📥 Testing subscribed file download...")
    
    response = requests.get(f"{PLAY_API}file/{TEST_FILE_ID}/", headers=HEADERS)
    
    if response.status_code == 200:
        content_length = len(response.content)
        content_type = response.headers.get('content-type', 'unknown')
        content_disposition = response.headers.get('content-disposition', '')
        
        print(f"✅ File downloaded successfully!")
        print(f"   Size: {content_length} bytes")
        print(f"   Content Type: {content_type}")
        print(f"   Disposition: {content_disposition}")
        return True
    else:
        print(f"❌ Download failed: {response.status_code} - {response.text}")
        return False


def test_get_subscribed_file_thumbnail(TEST_FILE_ID):
    """Test getting thumbnail for subscribed file"""
    print("🖼️  Testing subscribed file thumbnail...")
    
    response = requests.get(f"{PLAY_API}file/{TEST_FILE_ID}/thumbnail/", headers=HEADERS)
    
    if response.status_code == 200:
        thumbnail_size = len(response.content)
        content_type = response.headers.get('content-type', 'unknown')
        cache_control = response.headers.get('cache-control', '')
        
        print(f"✅ Thumbnail retrieved successfully!")
        print(f"   Size: {thumbnail_size} bytes")
        print(f"   Content Type: {content_type}")
        print(f"   Cache Control: {cache_control}")
        return True
    elif response.status_code == 404:
        print("ℹ️  No thumbnail available for this file")
        return True
    else:
        print(f"❌ Thumbnail failed: {response.status_code} - {response.text}")
        return False


def test_get_user_subscribed_channels():
    """Test getting all subscribed channels for the user"""
    print("📺 Testing user subscribed channels...")
    
    response = requests.get(f"{PLAY_API}subscriptions/", headers=HEADERS)
    
    if response.status_code == 200:
        data = response.json()
        channels = data.get('data', [])
        
        print(f"✅ Subscribed channels retrieved successfully!")
        print(f"   Total subscribed channels: {len(channels)}")
        
        for channel in channels:
            subscription_details = channel.get('subscription_details', {})
            print(f"   📌 {channel.get('name', 'Unknown')}")
            print(f"      Channel ID: {channel.get('channel_id', 'N/A')}")
            print(f"      Full Access: {subscription_details.get('full_access', False)}")
            print(f"      Hearts Earned: {subscription_details.get('hearts_earned', 0)}")
        
        return True, channels
    else:
        print(f"❌ Get subscribed channels failed: {response.status_code} - {response.text}")
        return False, []


def main():
    """Run Play Space API success tests"""
    print("Play Space API Test Suite - Success Cases")
    print("=" * 42)

    TEST_FILE_ID = '661f14bf72b568b13257f8ea'  # Update this with actual file ID
    
    print(f"🎯 Testing with file ID: {TEST_FILE_ID}")
    print("-" * 50)
    
    # Test subscribed channels endpoint
    channels_success, channels = test_get_user_subscribed_channels()
    
    # Test file download
    download_success = test_download_subscribed_file(TEST_FILE_ID)
    
    # Test thumbnail retrieval
    thumbnail_success = test_get_subscribed_file_thumbnail(TEST_FILE_ID)
    
    # Summary
    print("\n📊 Test Results Summary")
    print("-" * 25)
    print(f"Subscribed Channels Test: {'✅ PASSED' if channels_success else '❌ FAILED'}")
    print(f"Download Test: {'✅ PASSED' if download_success else '❌ FAILED'}")
    print(f"Thumbnail Test: {'✅ PASSED' if thumbnail_success else '❌ FAILED'}")
    
    if channels_success and download_success and thumbnail_success:
        print("\n🎉 All tests passed!")
    else:
        print("\n⚠️  Some tests failed - check subscription access")


if __name__ == "__main__":
    main() 

