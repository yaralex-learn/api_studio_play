#!/usr/bin/env python3
"""
Test script for channel content endpoints
"""

import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8080"
# BASE_URL = "https://api.yaralex.com"

SETTING_API = f"{BASE_URL}/studio/channel/setting/"
CONTENT_API = f"{BASE_URL}/studio/channel/content/"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGEwNTRmNGJhY2Q0ZDcxM2U1M2E1MDIiLCJleHAiOjE3NTU1NDI3NjYsImlhdCI6MTc1NTUwNjc2NiwidHlwZSI6ImFjY2VzcyJ9.t9HHKOQC2A9i7Q7rzxXEiZ2TTNXbcz4HnRb94002owU"


HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}

# Test data
CHANNEL_DATA = {
    "name": "Content Test Channel",
    "description": "Channel for testing content APIs",
    "primary_language": "en",
    "target_language": "es",
    "avatar_file_id": "661f14bf72b568b13257f8e8",
    "cover_image_file_id": "661f14bf72b568b13257f8e9"
}

SECTION_OUTLINE_DATA = {
    "name": "Introduction Section"
}

SECTION_DATA = {
    "section_outline_id": "",  # Will be filled
    "name": "Introduction Section Content",
    "description": "Introduction section with content",
    "file_id": "661f14bf72b568b13257f8e8",
}

UNIT_OUTLINE_DATA = {
    "section_outline_id": "",  # Will be filled
    "name": "Getting Started Unit"
}

UNIT_DATA = {
    "unit_outline_id": "",  # Will be filled
    "name": "Getting Started Unit Content",
    "description": "Unit about getting started",
    "file_id": "661f14bf72b568b13257f8e9"
}

ACTIVITY_OUTLINE_DATA = {
    "unit_outline_id": "",  # Will be filled
    "name": "First Activity"
}

ACTIVITY_DATA = {
    "activity_outline_id": "",  # Will be filled
    "description": "First learning activity",
    "file_id": "661f14bf72b568b13257f8ea",
    "difficulty_level": 1,
    "is_launched": True
}

LESSON_OUTLINE_DATA = {
    "activity_outline_id": "",  # Will be filled
    "name": "Lesson 667",
    "lesson_type": "text"
}

LESSON_DATA = [{
    "lesson_outline_id": "",  # Will be filled
    "lesson_type": "text",
    "text": "This is the lesson content",
    "file_ids": ["661f14bf72b568b13257f8eb"],
    "question_lesson": {"question": "What is this?", "answer": "A lesson"},
    "order": 1,
    "is_launched": True,
    "is_free": False
}]

QUIZ_OUTLINE_DATA = {
    "activity_outline_id": "",  # Will be filled
    "name": "Quiz 1",
    "is_launched": True,
    "is_free": False
}

QUESTION_DATA = [{
    "quiz_outline_id": "",  # Will be filled
    "time_limit": 30,
    "points": 10,
    "template": {
        "type": "multiple_choice",
        "question": "What is 2+2?",
        "options": ["3", "4", "5", "6"]
    },
    "generated_question": {
        "type": "multiple_choice",
        "question": "What is 2+2?",
        "options": ["3", "4", "5", "6"],
        "answer": "4"
    },
    "file_id": "661f14bf72b568b13257f8ec",
    "check_function": "def check(ans): return ans == '4'",
    "order": 1,
    "is_accepted": True
}]

def create_test_channel():
    """Create a test channel"""
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

def test_create_section_outline(channel_id):
    """Test creating section outline"""
    print("📝 Testing section outline creation...")
    
    # Include required fields in the request body
    section_outline_data = SECTION_OUTLINE_DATA.copy()
    section_outline_data["channel_id"] = channel_id
    section_outline_data["order"] = 1
    
    response = requests.post(
        f"{CONTENT_API}{channel_id}/sections/outline/1/",
        headers=HEADERS,
        json=section_outline_data
    )
    
    if response.status_code == 200:
        data = response.json()
        section_outline_id = data.get("id")
        print(f"✅ Section outline created! ID: {section_outline_id}")
        return section_outline_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_section(channel_id, section_outline_id):
    """Test creating section content"""
    print("📄 Testing section content creation...")
    
    section_data = SECTION_DATA.copy()
    section_data["section_outline_id"] = section_outline_id
    
    response = requests.post(
        f"{CONTENT_API}{channel_id}/sections/",
        headers=HEADERS,
        json=section_data
    )
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Section content created!")
        return data.get("id")
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_unit_outline(channel_id, section_outline_id):
    """Test creating unit outline"""
    print("📋 Testing unit outline creation...")
    
    unit_outline_data = UNIT_OUTLINE_DATA.copy()
    unit_outline_data["section_outline_id"] = section_outline_id
    unit_outline_data["order"] = 1
    
    response = requests.post(
        f"{CONTENT_API}{channel_id}/units/outline/1/",
        headers=HEADERS,
        json=unit_outline_data
    )
    
    if response.status_code == 200:
        data = response.json()
        unit_outline_id = data.get("id")
        print(f"✅ Unit outline created! ID: {unit_outline_id}")
        return unit_outline_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_unit(channel_id, unit_outline_id):
    """Test creating unit content"""
    print("📦 Testing unit content creation...")
    
    unit_data = UNIT_DATA.copy()
    unit_data["unit_outline_id"] = unit_outline_id
    
    response = requests.post(
        f"{CONTENT_API}{channel_id}/units/",
        headers=HEADERS,
        json=unit_data
    )
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Unit content created!")
        return data.get("id")
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_activity_outline(channel_id, unit_outline_id):
    """Test creating activity outline"""
    print("🎯 Testing activity outline creation...")
    
    activity_outline_data = ACTIVITY_OUTLINE_DATA.copy()
    activity_outline_data["unit_outline_id"] = unit_outline_id
    activity_outline_data["order"] = 2
    
    response = requests.post(
        f"{CONTENT_API}{channel_id}/activities/outline/1/",
        headers=HEADERS,
        json=activity_outline_data
    )
    
    if response.status_code == 200:
        data = response.json()
        activity_outline_id = data.get("id")
        print(f"✅ Activity outline created! ID: {activity_outline_id}")
        return activity_outline_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_activity(channel_id, activity_outline_id):
    """Test creating activity content"""
    print("🎮 Testing activity content creation...")
    
    activity_data = ACTIVITY_DATA.copy()
    activity_data["activity_outline_id"] = activity_outline_id
    
    response = requests.post(
        f"{CONTENT_API}{channel_id}/activities/",
        headers=HEADERS,
        json=activity_data
    )
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Activity content created!")
        return data.get("id")
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_lesson_outline(channel_id, activity_outline_id):
    """Test creating lesson outline"""
    print("📚 Testing lesson outline creation...")
    
    lesson_outline_data = LESSON_OUTLINE_DATA.copy()
    lesson_outline_data["activity_outline_id"] = activity_outline_id
    lesson_outline_data["order"] = 5
    
    response = requests.post(
        f"{CONTENT_API}{channel_id}/lessons/outline/2/",
        headers=HEADERS,
        json=lesson_outline_data
    )
    
    if response.status_code == 200:
        data = response.json()
        lesson_outline_id = data.get("id")
        print(f"✅ Lesson outline created! ID: {lesson_outline_id}")
        return lesson_outline_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_lesson(channel_id, lesson_outline_id):
    """Test creating lesson content"""
    print("📖 Testing lesson content creation...")
    
    lesson_data = LESSON_DATA.copy()
    lesson_data[0]["order"] = 2
    lesson_data[0]["lesson_outline_id"] = lesson_outline_id
    
    response = requests.post(
        f"{CONTENT_API}{channel_id}/lessons/",
        headers=HEADERS,
        json=lesson_data
    )
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Lesson content created!")
        return data[0].get("id") if data else None
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_quiz_outline(channel_id, activity_outline_id):
    """Test creating quiz outline"""
    print("❓ Testing quiz outline creation...")
    
    quiz_outline_data = QUIZ_OUTLINE_DATA.copy()
    quiz_outline_data["activity_outline_id"] = activity_outline_id
    quiz_outline_data["order"] = 1
    quiz_outline_data["quiz_count"] = 1
    
    response = requests.post(
        f"{CONTENT_API}{channel_id}/quizzes/outline/1/",
        headers=HEADERS,
        json=quiz_outline_data
    )
    
    if response.status_code == 200:
        data = response.json()
        quiz_outline_id = data.get("id")
        print(f"✅ Quiz outline created! ID: {quiz_outline_id}")
        return quiz_outline_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_question(channel_id, quiz_outline_id):
    """Test creating question content"""
    print("❔ Testing question creation...")
    
    question_data = QUESTION_DATA.copy()
    question_data[0]["quiz_outline_id"] = quiz_outline_id
    
    response = requests.post(
        f"{CONTENT_API}{channel_id}/questions/",
        headers=HEADERS,
        json=question_data
    )
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Question created!")
        return data[0].get("id") if data else None
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_update_section_outline(channel_id, section_outline_id):
    """Test updating section outline"""
    print("✏️  Testing section outline update...")
    
    update_data = {
        "channel_id": channel_id,
        "name": "Updated Introduction Section", 
        "order": 1
    }
    
    response = requests.put(
        f"{CONTENT_API}{channel_id}/sections/outline/{section_outline_id}/",
        headers=HEADERS,
        json=update_data
    )
    
    if response.status_code == 200:
        print("✅ Section outline updated!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_update_unit_outline(channel_id, unit_outline_id, section_outline_id):
    """Test updating unit outline"""
    print("✏️  Testing unit outline update...")
    
    update_data = {
        "section_outline_id": section_outline_id,
        "name": "Updated Getting Started Unit", 
        "order": 1
    }
    
    response = requests.put(
        f"{CONTENT_API}{channel_id}/units/outline/{unit_outline_id}/",
        headers=HEADERS,
        json=update_data
    )
    
    if response.status_code == 200:
        print("✅ Unit outline updated!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_update_activity_outline(channel_id, activity_outline_id, unit_outline_id):
    """Test updating activity outline"""
    print("✏️  Testing activity outline update...")
    
    update_data = {
        "unit_outline_id": unit_outline_id,
        "name": "Updated First Activity", 
        "order": 1
    }
    
    response = requests.put(
        f"{CONTENT_API}{channel_id}/activities/outline/{activity_outline_id}/",
        headers=HEADERS,
        json=update_data
    )
    
    if response.status_code == 200:
        print("✅ Activity outline updated!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_delete_section_outline(channel_id, section_outline_id):
    """Test deleting section outline"""
    print("🗑️  Testing section outline deletion...")
    
    response = requests.delete(
        f"{CONTENT_API}{channel_id}/sections/outline/{section_outline_id}/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        print("✅ Section outline deleted!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_delete_unit_outline(channel_id, unit_outline_id):
    """Test deleting unit outline"""
    print("🗑️  Testing unit outline deletion...")
    
    response = requests.delete(
        f"{CONTENT_API}{channel_id}/units/outline/{unit_outline_id}/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        print("✅ Unit outline deleted!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_delete_lesson(channel_id, lesson_id):
    """Test deleting lesson content"""
    print("🗑️  Testing lesson content deletion...")
    
    response = requests.delete(
        f"{CONTENT_API}{channel_id}/lessons/{lesson_id}/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        print("✅ Lesson content deleted!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_delete_question(channel_id, question_id):
    """Test deleting question content"""
    print("🗑️  Testing question content deletion...")
    
    response = requests.delete(
        f"{CONTENT_API}{channel_id}/questions/{question_id}/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        print("✅ Question content deleted!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def test_delete_activity_outline(channel_id, activity_outline_id):
    """Test deleting activity outline"""
    print("🗑️  Testing activity outline deletion...")
    
    response = requests.delete(
        f"{CONTENT_API}{channel_id}/activities/outline/{activity_outline_id}/",
        headers=HEADERS
    )
    
    if response.status_code == 200:
        print("✅ Activity outline deleted!")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
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
    """Run all content tests"""
    print("Channel Content API Test Suite")
    print("=" * 40)
    
    # Create test channel
    channel_id = create_test_channel()
    if not channel_id:
        return
    
    # Store IDs for later testing
    section_outline_id = None
    unit_outline_id = None
    activity_outline_id = None
    lesson_id = None
    question_id = None
    
    # Test content creation flow
    section_outline_id = test_create_section_outline(channel_id)
    if section_outline_id:
        test_create_section(channel_id, section_outline_id)
        
        unit_outline_id = test_create_unit_outline(channel_id, section_outline_id)
        if unit_outline_id:
            test_create_unit(channel_id, unit_outline_id)
            
            activity_outline_id = test_create_activity_outline(channel_id, unit_outline_id)
            if activity_outline_id:
                test_create_activity(channel_id, activity_outline_id)
                
                # Test lesson flow
                lesson_outline_id = test_create_lesson_outline(channel_id, activity_outline_id)
                if lesson_outline_id:
                    lesson_id = test_create_lesson(channel_id, lesson_outline_id)
                
                # Test quiz flow
                quiz_outline_id = test_create_quiz_outline(channel_id, activity_outline_id)
                if quiz_outline_id:
                    question_id = test_create_question(channel_id, quiz_outline_id)
    
    # Test update operations
    print("\n" + "=" * 40)
    print("Testing Update Operations")
    print("=" * 40)
    
    if section_outline_id:
        test_update_section_outline(channel_id, section_outline_id)
    
    if unit_outline_id:
        test_update_unit_outline(channel_id, unit_outline_id, section_outline_id)
    
    if activity_outline_id:
        test_update_activity_outline(channel_id, activity_outline_id, unit_outline_id)
    
    # Test delete operations for content
    print("\n" + "=" * 40)
    print("Testing Content Delete Operations")
    print("=" * 40)
    
    if lesson_id:
        test_delete_lesson(channel_id, lesson_id)
    
    if question_id:
        test_delete_question(channel_id, question_id)
    
    # Test delete operations for outlines
    print("\n" + "=" * 40)
    print("Testing Outline Delete Operations")
    print("=" * 40)
    
    if activity_outline_id:
        test_delete_activity_outline(channel_id, activity_outline_id)
    
    if unit_outline_id:
        test_delete_unit_outline(channel_id, unit_outline_id)
    
    if section_outline_id:
        test_delete_section_outline(channel_id, section_outline_id)
    
    # Cleanup
    cleanup = input("\nDelete test channel? (Y/n): ").strip().lower()
    if cleanup != 'n':
        cleanup_channel(channel_id)
    else:
        print(f"💾 Test channel preserved: {channel_id}")
    
    print("\n🏁 Content tests completed!")

if __name__ == "__main__":
    main() 