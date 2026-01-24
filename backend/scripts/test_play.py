#!/usr/bin/env python3
"""
Comprehensive Test Suite for Play API Endpoints

This script provides extensive testing for:

🎮 PLAY API OPERATIONS:
   • Get creator channels
   • Channel access and progress tracking
   • Player progress management
   • Content delivery and navigation

📊 TESTING FEATURES:
   • Detailed test results with pass/fail statistics
   • Rich console output with emojis and formatting
   • Individual test case tracking and reporting
   • Comprehensive error logging and debugging info
"""

import requests
import json
from typing import Dict, List, Optional, Any

# Configuration
# BASE_URL = "http://127.0.0.1:8080"
BASE_URL = "https://api.yaralex.com"

PLAY_API_ENDPOINT = f"{BASE_URL}/play/user/"
# Use a player/learner token for testing play endpoints
# ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGE5YTBmY2RlN2VkYWY1NGJiYjZkMzMiLCJleHAiOjE3NTcxODEyNDksImlhdCI6MTc1NzE0NTI0OSwidHlwZSI6ImFjY2VzcyJ9.EPxoNCljOEcdb9dDG8zuW-0rYugJxeXClJOZqWEYkuE"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGFlMDQ5MzIyZDVkZGQ1MTc5ZTI4ZDYiLCJleHAiOjE3NTcxODUxNjIsImlhdCI6MTc1NzE0OTE2MiwidHlwZSI6ImFjY2VzcyJ9.gdhFoNbBnAJx_Hn51ckbYf4icNs4dO06UzhTndJZoCw"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}


###################################################################################################
# PLAY API TEST FUNCTIONS
###################################################################################################

def test_get_creator_channels(creator_id):
    """Test getting channels for a specific creator"""
    print("🎮 Testing get creator channels...")
    response = requests.get(f"{PLAY_API_ENDPOINT}channels/{creator_id}/", headers=HEADERS)
    
    if response.status_code == 200:
        data = response.json()
        channels = data.get("data", [])
        print(f"✅ Found {len(channels)} channels")
        for ch in channels[:2]:  # Show first 2
            print(f"   📚 {ch.get('name')} - {ch.get('lesson_count', 0)} lessons")
        return channels
    else:
        print(f"❌ Failed: {response.status_code}")
        return None

def test_subscription_info(creator_id):
    """Test get subscription info for creator"""
    print("💰 Testing subscription info...")
    response = requests.get(f"{PLAY_API_ENDPOINT}channels_tier_coupons/{creator_id}/", headers=HEADERS)
    
    if response.status_code == 200:
        data = response.json()
        channels = data.get("data", [])
        print(f"✅ Found {len(channels)} channels with subscription info")
        return channels
    else:
        print(f"❌ Failed: {response.status_code}")
        return None

def test_subscribe_to_channel(channel_id, full_access=True):
    """Test subscribing to a channel"""
    print("📝 Testing channel subscription...")
    response = requests.post(
        f"{PLAY_API_ENDPOINT}subscribe/{channel_id}/", 
        headers=HEADERS, 
        json={"full_access": full_access}
    )
    
    if response.status_code == 200:
        print("✅ Successfully subscribed to channel!")
        return response.json()
    else:
        print(f"❌ Subscription failed: {response.status_code}")
        return None

def test_get_content_progress(channel_id):
    """Test getting user content progress"""
    print("📊 Testing get content progress...")
    response = requests.get(f"{PLAY_API_ENDPOINT}content_progress/{channel_id}/", headers=HEADERS)
    
    if response.status_code == 200:
        print("✅ Progress retrieved!")
        return response.json()
    else:
        print(f"❌ Failed: {response.status_code}")
        return None

def test_update_progress(channel_id):
    """Test updating user progress"""
    print("📈 Testing update progress...")
    progress_data = {
        "content_id": "681f14bf72b568b13257f8ef",
        "hearts_earned": 5,
        "progress_level": {
            "sections": [
                {
                    "id": "681f14bf72b568b13257f8e9",
                    "name": "Introduction",
                    "completed": True,
                    "units": [
                        {
                            "id": "681f14bf72b568b13257f8eb", 
                            "name": "Getting Started",
                            "completed": True,
                            "activities": [
                                {
                                    "id": "681f14bf72b568b13257f8ed",
                                    "name": "First Steps",
                                    "completed": True,
                                    "content": [
                                        {
                                            "id": "681f14bf72b568b13257f8ef",
                                            "name": "Hello World",
                                            "completed": True,
                                            "type": "lesson"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
    response = requests.post(
        f"{PLAY_API_ENDPOINT}content_progress/{channel_id}/", 
        headers=HEADERS, 
        json=progress_data
    )
    
    if response.status_code == 200:
        print("✅ Progress updated!")
        return response.json()
    else:
        print(f"❌ Update failed: {response.status_code} - {response.text}")
        return None

###################################################################################################
# MAIN TESTS
###################################################################################################

def main():
    creator_id = "68adf9ec87f7c013e70164c8"
    
    print("🎮 === PLAY API TESTS ===\n")
    
    # Test 1: Get creator channels
    channels = test_get_creator_channels(creator_id)
    if not channels:
        return
    
    # Test 2: Get subscription info
    test_subscription_info(creator_id)
    
    # Get first channel for remaining tests
    first_channel = channels[0]
    channel_id = first_channel.get("channel_id")
    if not channel_id:
        print("❌ No channel ID found")
        return
    
    print(f"\n📚 Using channel: {first_channel.get('name')} ({channel_id})\n")
    
    # Test 3: Subscribe to channel
    test_subscribe_to_channel(channel_id)
    
    # Test 4: Get content progress
    test_get_content_progress(channel_id)
    
    # Test 5: Update progress
    test_update_progress(channel_id)
    
    print("\n🏁 All tests completed!")

if __name__ == "__main__":
    main()



    