#!/usr/bin/env python3
"""
Test script for channel API endpoints
"""

import requests
import json

# Configuration
# BASE_URL = "http://127.0.0.1:8080"
BASE_URL = "https://api.yaralex.com"

SETTING_API = f"{BASE_URL}/studio/channel/setting/"
CHANNEL_API = f"{BASE_URL}/studio/channel/"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODc0YzE3YmQ2MzM1NTE3NjQzNWIyZTkiLCJleHAiOjE3NTI1MTgxODYsImlhdCI6MTc1MjQ4MjE4NiwidHlwZSI6ImFjY2VzcyJ9.fzSVKXodbcG-5Y-Dhq5SV5q4j3uAcnfdkAj8ja_h960"


HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}

# Test data
CHANNEL_DATA = {
    "name": "Channel API Test Channel",
    "description": "Channel for testing channel APIs",
    "primary_language": "en",
    "target_language": "es", 
    "avatar_file_id": "661f14bf72b568b13257f8e8",
    "cover_image_file_id": "661f14bf72b568b13257f8e9"
}

QUESTION_PROMPT_DATA = {
    "module_id": "section_123",
    "module_type": "section",
    "description": "Generate quiz questions about Python basics",
    "templates": [
        {
            "id": None,
            "template_num": 1,
            "template": "multiple_choice",
            "subject": "What is Python?",
            "options": ["Programming Language", "Snake", "Framework", "Database"],
            "time": 30,
            "point": 10,
            "count": 1
        },
        {
            "id": None,
            "template_num": 2,
            "template": "true_false",
            "subject": "Python is case-sensitive",
            "options": ["True", "False"],
            "time": 15,
            "point": 5,
            "count": 1
        }
    ]
}

LESSON_PROMPT_DATA = {
    "module_id": "lesson_123",
    "module_type": "lesson",
    "description": "Create a lesson about Python variables",
    "templates": [
        {
            "id": None,
            "template_num": 1,
            "template": "text_lesson",
            "subject": "Variables in Python",
            "content": "Variables are containers for storing data values",
            "time": 60,
            "point": 0,
            "count": 1
        }
    ]
}

SECTION_PROMPT_DATA = {
    "module_id": "section_456",
    "module_type": "section",
    "description": "Generate content for Python fundamentals section",
    "templates": [
        {
            "id": None,
            "template_num": 1,
            "template": "section_outline",
            "subject": "Python Fundamentals",
            "content": "Introduction to Python programming language",
            "time": 0,
            "point": 0,
            "count": 1
        }
    ]
}

UNIT_PROMPT_DATA = {
    "module_id": "unit_789",
    "module_type": "unit",
    "description": "Generate content for Python basics unit",
    "templates": [
        {
            "id": None,
            "template_num": 1,
            "template": "unit_outline",
            "subject": "Python Basics",
            "content": "Basic concepts of Python programming",
            "time": 0,
            "point": 0,
            "count": 1
        }
    ]
}

ACTIVITY_PROMPT_DATA = {
    "module_id": "activity_101",
    "module_type": "activity",
    "description": "Generate content for Python coding activity",
    "templates": [
        {
            "id": None,
            "template_num": 1,
            "template": "activity_outline",
            "subject": "Python Coding Exercise",
            "content": "Hands-on coding exercises for Python",
            "time": 0,
            "point": 0,
            "count": 1
        }
    ]
}

def create_test_channel():
    """Create a test channel for testing channel APIs"""
    print("🏗️  Creating test channel...")
    
    response = requests.post(SETTING_API, headers=HEADERS, json=CHANNEL_DATA)
    
    if response.status_code == 200:
        data = response.json()
        channel_id = data.get("id")
        print(f"✅ Channel created! ID: {channel_id}")
        return channel_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_get_all_channels():
    """Test getting all user channels"""
    print("📋 Testing get all channels...")
    
    response = requests.get(f"{CHANNEL_API}all_my_channels/", headers=HEADERS)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Retrieved {len(data)} channels!")
        if data:
            print(f"   First channel: {data[0].get('name')} (ID: {data[0].get('id')})")
        return data
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_get_channel_by_id(channel_id):
    """Test getting channel by ID"""
    print(f"🔍 Testing get channel by ID: {channel_id}...")
    
    response = requests.get(f"{CHANNEL_API}{channel_id}/", headers=HEADERS)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Channel retrieved! Name: {data.get('name')}")
        print(f"   Description: {data.get('description')}")
        print(f"   Sections: {data.get('section_count', 0)}, Units: {data.get('unit_count', 0)}")
        return data
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_question_prompt():
    """Test creating question prompts"""
    print("❓ Testing question prompt creation...")
    
    response = requests.post(
        f"{CHANNEL_API}prompts/questions/",
        headers=HEADERS,
        json=QUESTION_PROMPT_DATA
    )
    
    if response.status_code == 200:
        data = response.json()
        prompt_id = data.get("id")
        print(f"✅ Question prompt created! ID: {prompt_id}")
        if "template" in data:
            print(f"   Question: {data.get('template', {}).get('subject', 'N/A')}")
        return prompt_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_lesson_prompt():
    """Test creating lesson prompts"""
    print("📚 Testing lesson prompt creation...")
    
    response = requests.post(
        f"{CHANNEL_API}prompts/lesson/",
        headers=HEADERS,
        json=LESSON_PROMPT_DATA
    )
    
    if response.status_code == 200:
        data = response.json()
        prompt_id = data.get("id")
        print(f"✅ Lesson prompt created! ID: {prompt_id}")
        print(f"   Description: {data.get('description', 'N/A')}")
        return prompt_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_section_prompt():
    """Test creating section prompts"""
    print("📝 Testing section prompt creation...")
    
    response = requests.post(
        f"{CHANNEL_API}prompts/section/",
        headers=HEADERS,
        json=SECTION_PROMPT_DATA
    )
    
    if response.status_code == 200:
        data = response.json()
        prompt_id = data.get("id")
        print(f"✅ Section prompt created! ID: {prompt_id}")
        print(f"   Description: {data.get('description', 'N/A')}")
        return prompt_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_unit_prompt():
    """Test creating unit prompts"""
    print("📦 Testing unit prompt creation...")
    
    response = requests.post(
        f"{CHANNEL_API}prompts/unit/",
        headers=HEADERS,
        json=UNIT_PROMPT_DATA
    )
    
    if response.status_code == 200:
        data = response.json()
        prompt_id = data.get("id")
        print(f"✅ Unit prompt created! ID: {prompt_id}")
        print(f"   Description: {data.get('description', 'N/A')}")
        return prompt_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_activity_prompt():
    """Test creating activity prompts"""
    print("🎯 Testing activity prompt creation...")
    
    response = requests.post(
        f"{CHANNEL_API}prompts/activity/",
        headers=HEADERS,
        json=ACTIVITY_PROMPT_DATA
    )
    
    if response.status_code == 200:
        data = response.json()
        prompt_id = data.get("id")
        print(f"✅ Activity prompt created! ID: {prompt_id}")
        print(f"   Description: {data.get('description', 'N/A')}")
        return prompt_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_invalid_prompt_type():
    """Test creating prompt with invalid type"""
    print("❌ Testing invalid prompt type...")
    
    response = requests.post(
        f"{CHANNEL_API}prompts/invalid_type/",
        headers=HEADERS,
        json=QUESTION_PROMPT_DATA
    )
    
    if response.status_code == 400:
        print("✅ Invalid prompt type correctly rejected!")
        return True
    else:
        print(f"❌ Expected 400 error, got: {response.status_code}")
        return False

def cleanup_channel(channel_id):
    """Delete test channel"""
    print("🗑️  Cleaning up test channel...")
    
    response = requests.delete(f"{SETTING_API}{channel_id}/info/", headers=HEADERS)
    
    if response.status_code == 200:
        print("✅ Test channel deleted!")
    else:
        print(f"❌ Cleanup failed: {response.status_code}")

def main():
    """Run all channel API tests"""
    print("Channel API Test Suite")
    print("=" * 30)
    
    # Create test channel first
    channel_id = create_test_channel()
    if not channel_id:
        return
    
    print("\n🔍 Testing Channel Retrieval APIs")
    print("-" * 35)
    
    # Test channel retrieval APIs
    test_get_all_channels()
    test_get_channel_by_id(channel_id)
    
    print("\n🤖 Testing Prompt APIs")
    print("-" * 20)
    
    # Test different prompt types
    test_create_question_prompt()
    test_create_lesson_prompt()
    test_create_section_prompt()
    test_create_unit_prompt()
    test_create_activity_prompt()
    
    # Test error handling
    test_invalid_prompt_type()
    
    # Cleanup
    cleanup = input("\nDelete test channel? (Y/n): ").strip().lower()
    if cleanup != 'n':
        cleanup_channel(channel_id)
    else:
        print(f"💾 Test channel preserved: {channel_id}")
    
    print("\n🏁 Channel API tests completed!")

if __name__ == "__main__":
    main() 