#!/usr/bin/env python3
"""
Comprehensive Test Suite for Channel APIs and AI-Powered Features

This script provides extensive testing for:

🏗️  CHANNEL OPERATIONS:
   • Channel CRUD operations (create, read, update, delete)
   • Channel publishing and unpublishing functionality
   • Multi-channel management and retrieval

🤖 AI-POWERED FEATURES:
   • Question generation with multiple templates (multiple choice, fill-in-blank, true/false)
   • Text revision for different module types (lesson, activity, unit, section)
   • Edge case handling (empty inputs, invalid templates, missing fields)
   • Comprehensive error handling and validation testing

📊 TESTING FEATURES:
   • Detailed test results with pass/fail statistics
   • Rich console output with emojis and formatting
   • Individual test case tracking and reporting
   • Comprehensive error logging and debugging info
"""

import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8080"
# BASE_URL = "https://api.yaralex.com"

API_ENDPOINT = f"{BASE_URL}/studio/channel/setting/"
CHANNEL_API_ENDPOINT = f"{BASE_URL}/studio/channel/"
# ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGE0NDg0NmJkYzVmMWFjNGE2M2VjMTQiLCJleHAiOjE3NTU2MzI5MDcsImlhdCI6MTc1NTU5NjkwNywidHlwZSI6ImFjY2VzcyJ9.z8Nr0Ll2n14r04x6o6X_w7ZwlDsGAzf6_-S_--OBQOw"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGE5YTFhNGRlN2VkYWY1NGJiYjZkMzQiLCJleHAiOjE3NTYwNjE0MjUsImlhdCI6MTc1NjAyNTQyNSwidHlwZSI6ImFjY2VzcyJ9.sbQ19IiBciyCz3JyS468PXMyDxPxNCcHIijXMnHv1o4"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}

CHANNEL_DATA = {
    "name": "Test Channel",
    "description": "Test Description",
    "primary_language": "en",
    "target_language": "es",
    "avatar_file_id": "661f14bf72b568b13257f8e8",
    "cover_image_file_id": "661f14bf72b568b13257f8e9"
}

PUBLISH_DATA = {
    "channel_id": "",  # Will be filled dynamically
    "published": True,
    "channel_link": "https://example.com/my-channel"
}

PROMPT_DATA = {
    "module_id": "sec_123",
    "module_type": "section", 
    "description": "Generate a lesson about Python basics",
    "templates": [{
        "id": "template_1",
        "template_num": 1,
        "template": "text_lesson",
        "subject": "Python Introduction",
        "content": "Basic Python concepts",
        "time": 30,
        "point": 10,
        "count": 1
    }]
}

# AI Generation Test Data
AI_TEST_DATA = {
    "generate_questions": {
        "basic": {
            "initial_prompt": "Create questions about ordering food in a restaurant using present perfect tense",
            "template_id": 1,
            "difficulty": "intermediate",
            "num_questions": 3
        },
        "advanced": {
            "initial_prompt": "Advanced calculus concepts including derivatives and integrals",
            "template_id": 1,
            "difficulty": "hard",
            "num_questions": 2
        },
        "templates": [
            {
                "initial_prompt": "Weather patterns and climate change effects",
                "template_id": 2,
                "difficulty": "easy",
                "num_questions": 2,
                "name": "Weather Science Quiz"
            },
            {
                "initial_prompt": "Python programming fundamentals and data structures",
                "template_id": 3,
                "difficulty": "hard",
                "num_questions": 1,
                "name": "Python Advanced Quiz"
            }
        ],
        "edge_cases": [
            {
                "initial_prompt": "",
                "template_id": 1,
                "difficulty": "easy",
                "num_questions": 1,
                "expected_status": 500,
                "description": "Empty prompt"
            },
            {
                "initial_prompt": "Test prompt",
                "template_id": 999,
                "difficulty": "easy", 
                "num_questions": 1,
                "expected_status": 500,
                "description": "Invalid template ID"
            }
        ]
    },
    "generate_prompt": {
        "basic": {
            "text": "This lesson about restaurant food ordering. We learn present perfect tense here. Student will practice with waiter conversation.",
            "module_type": "lesson"
        },
        "modules": [
            {
                "text": "This activity help student practice speaking skill. They work in group and discuss different topic together.",
                "module_type": "activity",
                "description": "Activity text revision"
            },
            {
                "text": "Unit cover basic math concept. Include addition, subtraction, multiplication and division operation for beginner.",
                "module_type": "unit",
                "description": "Unit description revision"
            },
            {
                "text": "Section introduce student to science field. Cover physics, chemistry, biology topic for complete beginner student.",
                "module_type": "section", 
                "description": "Section overview revision"
            }
        ],
        "error_cases": [
            {
                "text": "Some text to revise",
                "module_type": "invalid_type",
                "expected_status": 400,
                "description": "Invalid module type"
            },
            {
                "text": "Some text to revise",
                "expected_status": 422,
                "description": "Missing module_type field"
            }
        ]
    }
}

def test_create_channel():
    """Test creating a new channel"""
    print("🚀 Testing channel creation...")
    response = requests.post(API_ENDPOINT, headers=HEADERS, json=CHANNEL_DATA)
    
    if response.status_code == 200:
        data = response.json()
        channel_id = data.get("id")
        print(f"✅ Channel created! ID: {channel_id}")
        return channel_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None


def test_publish_channel(channel_id):
    """Test publishing a channel"""
    print("📢 Testing channel publish...")
    
    # Update publish data with actual channel_id
    publish_payload = PUBLISH_DATA.copy()
    publish_payload["channel_id"] = channel_id
    
    response = requests.patch(
        f"{API_ENDPOINT}{channel_id}/publish/", 
        headers=HEADERS, 
        json=publish_payload
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Channel published! Status: {data.get('published')}")
        return data
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_get_publish_info(channel_id):
    """Test getting publish channel info"""
    print("📊 Testing get publish info...")
    response = requests.get(f"{API_ENDPOINT}{channel_id}/publish/", headers=HEADERS)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Publish info retrieved! Published: {data.get('published')}")
        return data
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_update_channel(channel_id):
    """Test updating channel"""
    print("✏️  Testing channel update...")
    update_data = {
        "name": "Test Channel",
        "description": "Test Description",
        "primary_language": "en",
        "target_language": "es",
        "avatar_file_id": "661f14bf72b568b13257f8e8",
        "cover_image_file_id": "661f14bf72b568b13257f8e9"
    }
    response = requests.put(f"{API_ENDPOINT}{channel_id}/info/", headers=HEADERS, json=update_data)
    
    if response.status_code == 200:
        print("✅ Channel updated!")
        return response.json()
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None


#### CHannel.py API #############################################################################
def test_get_all_channels():
    """Test getting all user channels"""
    print("📋 Testing get all channels...")
    response = requests.get(f"{CHANNEL_API_ENDPOINT}all_my_channels/", headers=HEADERS)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Retrieved {len(data)} channels!")
        return data
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_get_channel_by_id(channel_id):
    """Test getting channel by ID with content"""
    print("🔍 Testing get channel by ID...")
    response = requests.get(f"{CHANNEL_API_ENDPOINT}{channel_id}/", headers=HEADERS)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Channel content retrieved!")
        return data
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_prompt():
    """Test creating a prompt"""
    print("💡 Testing create prompt...")
    response = requests.post(
        f"{CHANNEL_API_ENDPOINT}prompts/lesson/", 
        headers=HEADERS, 
        json=PROMPT_DATA
    )
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Prompt created!")
        return data
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_generate_questions():
    """Test AI question generation with comprehensive scenarios"""
    print("🎯 === TESTING AI QUESTION GENERATION ===")
    results = {"passed": 0, "failed": 0, "total": 0}
    
    # Test basic question generation
    print("\n📝 Basic Question Generation:")
    success = _run_question_test(AI_TEST_DATA["generate_questions"]["basic"], "Restaurant vocabulary")
    _update_results(results, success)
    
    # Test advanced difficulty
    print("\n🚀 Advanced Difficulty Questions:")
    success = _run_question_test(AI_TEST_DATA["generate_questions"]["advanced"], "Advanced calculus")
    _update_results(results, success)
    
    # Test different templates
    print("\n🎨 Multiple Template Testing:")
    for template_test in AI_TEST_DATA["generate_questions"]["templates"]:
        success = _run_question_test(template_test, template_test.get("name", "Template test"))
        _update_results(results, success)
    
    # Test edge cases and error handling
    print("\n🚨 Edge Cases & Error Handling:")
    for edge_case in AI_TEST_DATA["generate_questions"]["edge_cases"]:
        expected_status = edge_case.pop("expected_status", 200)
        description = edge_case.pop("description", "Edge case")
        success = _run_question_test(edge_case, description, expected_status)
        _update_results(results, success)
    
    # Print summary
    print(f"\n📊 Question Generation Summary:")
    print(f"   ✅ Passed: {results['passed']}/{results['total']}")
    print(f"   ❌ Failed: {results['failed']}/{results['total']}")
    print(f"   📈 Success Rate: {(results['passed']/results['total']*100):.1f}%" if results['total'] > 0 else "N/A")
    
    return results["failed"] == 0

def test_generate_prompt():
    """Test AI text revision for multiple module types"""
    print("📝 === TESTING AI TEXT REVISION ===")
    results = {"passed": 0, "failed": 0, "total": 0}
    
    # Test basic text revision
    print("\n✏️  Basic Text Revision:")
    success = _run_prompt_test(AI_TEST_DATA["generate_prompt"]["basic"], "Lesson content")
    _update_results(results, success)
    
    # Test different module types
    print("\n🏗️  Module Type Testing:")
    for module_test in AI_TEST_DATA["generate_prompt"]["modules"]:
        description = module_test.pop("description", f"{module_test['module_type']} revision")
        success = _run_prompt_test(module_test, description)
        _update_results(results, success)
    
    # Test error handling
    print("\n🚨 Error Handling:")
    for error_case in AI_TEST_DATA["generate_prompt"]["error_cases"]:
        expected_status = error_case.pop("expected_status", 200)
        description = error_case.pop("description", "Error case")
        success = _run_prompt_test(error_case, description, expected_status)
        _update_results(results, success)
    
    # Print summary
    print(f"\n📊 Text Revision Summary:")
    print(f"   ✅ Passed: {results['passed']}/{results['total']}")
    print(f"   ❌ Failed: {results['failed']}/{results['total']}")
    print(f"   📈 Success Rate: {(results['passed']/results['total']*100):.1f}%" if results['total'] > 0 else "N/A")
    
    return results["failed"] == 0

###################################################################################################
# AI TESTING HELPER FUNCTIONS
# These functions provide reusable test execution logic for AI endpoints
###################################################################################################

def _run_question_test(test_data, description, expected_status=200):
    """Helper function to run a single question generation test"""
    print(f"   🧪 {description}")
    
    try:
        response = requests.post(
            f"{CHANNEL_API_ENDPOINT}generate-questions/", 
            headers=HEADERS, 
            json=test_data
        )
        
        success = response.status_code == expected_status
        
        if success:
            print(f"      ✅ PASSED (Status: {response.status_code})")
            if expected_status == 200:
                data = response.json()
                print(f"      📊 Generated: {data.get('num_questions', 0)} questions")
                print(f"      🎯 Template: {data.get('template_id')}")
                print(f"      📈 Difficulty: {data.get('difficulty')}")
        else:
            print(f"      ❌ FAILED (Expected: {expected_status}, Got: {response.status_code})")
            if response.status_code != expected_status:
                print(f"      📄 Response: {response.text[:100]}...")
        
        return success
        
    except Exception as e:
        print(f"      ❌ ERROR: {str(e)}")
        return False

def _run_prompt_test(test_data, description, expected_status=200):
    """Helper function to run a single text revision test"""
    print(f"   🧪 {description}")
    
    try:
        response = requests.post(
            f"{CHANNEL_API_ENDPOINT}generate_prompt/", 
            headers=HEADERS, 
            json=test_data
        )
        
        success = response.status_code == expected_status
        
        if success:
            print(f"      ✅ PASSED (Status: {response.status_code})")
            if expected_status == 200:
                data = response.json()
                original = data.get('original_text', '')[:40]
                revised = data.get('revised_text', '')[:40]
                print(f"      📖 Original: {original}...")
                print(f"      ✨ Revised: {revised}...")
                print(f"      📚 Module: {data.get('module_type')}")
        else:
            print(f"      ❌ FAILED (Expected: {expected_status}, Got: {response.status_code})")
            if response.status_code != expected_status:
                print(f"      📄 Response: {response.text[:100]}...")
        
        return success
        
    except Exception as e:
        print(f"      ❌ ERROR: {str(e)}")
        return False

def _update_results(results, success):
    """Helper function to update test results"""
    results["total"] += 1
    if success:
        results["passed"] += 1
    else:
        results["failed"] += 1

def test_ai_generation_comprehensive():
    """Run comprehensive AI generation tests"""
    print("🤖 === COMPREHENSIVE AI GENERATION TESTS ===")
    print("Testing both question generation and text revision with various scenarios\n")
    
    # Run question generation tests
    question_success = test_generate_questions()
    
    # Run text revision tests  
    prompt_success = test_generate_prompt()
    
    # Overall results
    print("\n" + "="*60)
    print("🎯 OVERALL AI GENERATION TEST RESULTS")
    print("="*60)
    
    if question_success and prompt_success:
        print("🎉 ALL AI GENERATION TESTS PASSED!")
        status = "✅ SUCCESS"
    else:
        print("⚠️  SOME AI GENERATION TESTS FAILED")
        status = "❌ PARTIAL FAILURE"
        if not question_success:
            print("   • Question Generation: FAILED")
        if not prompt_success:
            print("   • Text Revision: FAILED")
    
    print(f"Final Status: {status}")
    print("="*60)
    
    return question_success and prompt_success

###################################################################################################
def cleanup_channel(channel_id):
    """Delete test channel"""
    print("🗑️  Cleaning up...")
    response = requests.delete(f"{API_ENDPOINT}{channel_id}/info/", headers=HEADERS)
    
    if response.status_code == 200:
        print("✅ Channel deleted!")
    else:
        print(f"❌ Delete failed: {response.status_code}")

def main():
    """Run all tests"""
    print("Channel API Test Suite")
    print("=" * 30)
    
    # Setting endpoints test sequence
    channel_id = test_create_channel()
    if not channel_id:
        return
    
    test_publish_channel(channel_id)
    test_get_publish_info(channel_id)
    test_update_channel(channel_id)
    
    # Channel endpoints test sequence
    print("\n" + "=" * 30)
    print("Testing Channel Content API")
    test_get_all_channels()
    test_get_channel_by_id(channel_id)
    test_create_prompt()
    
    # AI-powered endpoints test sequence
    print("\n" + "=" * 50)
    print("🤖 TESTING AI-POWERED ENDPOINTS")
    print("=" * 50)
    
    # Run comprehensive AI generation tests
    ai_success = test_ai_generation_comprehensive()
    
    # Optional: Run individual tests for debugging
    # test_generate_questions()
    # test_generate_prompt()
    
    # Cleanup
    cleanup = input("\nDelete test channel? (Y/n): ").strip().lower()
    if cleanup != 'n':
        cleanup_channel(channel_id)
    else:
        print(f"💾 Channel preserved: {channel_id}")
    
    print("\n🏁 Tests completed!")

if __name__ == "__main__":
    main() 