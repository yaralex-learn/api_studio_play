#!/usr/bin/env python3
"""
Test script for Space API endpoints
"""

import requests
import json
import io
import os
from typing import Optional, List

# Configuration
BASE_URL = "http://127.0.0.1:8080"
# BASE_URL = "https://api.yaralex.com"
SPACE_API = f"{BASE_URL}/studio/space/"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGE5YTFhNGRlN2VkYWY1NGJiYjZkMzQiLCJleHAiOjE3NTcxODMzMDksImlhdCI6MTc1NzE0NzMwOSwidHlwZSI6ImFjY2VzcyJ9.OIpBCJbHUZvOPfruGjXKnjyFtqEsHsUNQzaUl48AYsY"

HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}

JSON_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}

# Test data
TEST_DIR_DATA = {
    "name": "Test Directory",
    "parent_id": None
}

TEST_SUBDIR_DATA = {
    "name": "Test Subdirectory",
    "parent_id": None  # Will be set dynamically
}

# Global variables to track created resources
created_files = []
created_dirs = []

def create_test_file(filename: str, content: str = "Test file content") -> io.BytesIO:
    """Create a test file in memory"""
    return io.BytesIO(content.encode('utf-8'))

def test_get_space():
    """Test getting space information"""
    print("🌌 Testing get space...")
    
    response = requests.get(SPACE_API, headers=HEADERS)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Space retrieved!")
        print(f"   Used space: {data.get('used_space_mb', 0)} MB")
        print(f"   Free space: {data.get('free_space_mb', 0)} MB")
        print(f"   Content items: {len(data.get('content', []))}")
        return data
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_directory():
    """Test creating a directory"""
    print("📁 Testing directory creation...")
    
    response = requests.post(
        f"{SPACE_API}dir/",
        headers=JSON_HEADERS,
        json=TEST_DIR_DATA
    )
    
    if response.status_code == 200:
        data = response.json()
        dir_id = data.get("id")
        print(f"✅ Directory created! ID: {dir_id}")
        print(f"   Name: {data.get('name')}")
        created_dirs.append(dir_id)
        return dir_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_create_subdirectory(parent_id: str):
    """Test creating a subdirectory"""
    print("📂 Testing subdirectory creation...")
    
    subdir_data = TEST_SUBDIR_DATA.copy()
    subdir_data["parent_id"] = parent_id
    
    response = requests.post(
        f"{SPACE_API}dir/",
        headers=JSON_HEADERS,
        json=subdir_data
    )
    
    if response.status_code == 200:
        data = response.json()
        dir_id = data.get("id")
        print(f"✅ Subdirectory created! ID: {dir_id}")
        print(f"   Name: {data.get('name')}")
        print(f"   Parent ID: {data.get('parent_id')}")
        created_dirs.append(dir_id)
        return dir_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_upload_file(directory_id: Optional[str] = None):
    """Test uploading a file"""
    print("📤 Testing file upload...")
    
    # Create test file
    test_content = "This is a test file for the Space API test suite!"
    
    files = {
        'file': ('test_file.txt', test_content, 'text/plain')
    }
    
    data = {}
    if directory_id:
        data['directory_id'] = directory_id
    
    response = requests.post(
        f"{SPACE_API}file/",
        headers=HEADERS,
        files=files,
        data=data
    )
    
    if response.status_code == 200:
        file_data = response.json()
        file_id = file_data.get("id")
        print(f"✅ File uploaded! ID: {file_id}")
        print(f"   Name: {file_data.get('name')}")
        print(f"   Size: {file_data.get('size')} bytes")
        created_files.append(file_id)
        return file_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_upload_image_file(directory_id: Optional[str] = None):
    """Test uploading an image file"""
    print("🖼️  Testing image file upload...")
    
    # Create a simple PNG file (1x1 pixel)
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00IEND\xaeB`\x82'
    
    files = {
        'file': ('test_image.png', png_data, 'image/png')
    }
    
    data = {}
    if directory_id:
        data['directory_id'] = directory_id
    
    response = requests.post(
        f"{SPACE_API}file/",
        headers=HEADERS,
        files=files,
        data=data
    )
    
    if response.status_code == 200:
        file_data = response.json()
        file_id = file_data.get("id")
        print(f"✅ Image uploaded! ID: {file_id}")
        print(f"   Name: {file_data.get('name')}")
        print(f"   Has thumbnail: {file_data.get('has_thumbnail', False)}")
        created_files.append(file_id)
        return file_id
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_get_directory_details(dir_id: str):
    """Test getting directory details"""
    print(f"📋 Testing directory details: {dir_id}...")
    
    response = requests.get(
        f"{SPACE_API}dir/{dir_id}/details/",
        headers=HEADERS,
        params={
            "include_contents": True,
            "include_breadcrumb": True
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Directory details retrieved!")
        print(f"   Name: {data.get('name')}")
        print(f"   Files: {data.get('files_count', 0)}")
        print(f"   Directories: {data.get('directories_count', 0)}")
        contents = data.get('contents', [])
        if contents:
            print(f"   Contents: {len(contents)} items")
        return data
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_move_file(file_id: str, target_dir_id: str):
    """Test moving a file"""
    print(f"📦 Testing file move: {file_id} -> {target_dir_id}...")
    
    response = requests.put(
        f"{SPACE_API}file/{file_id}/",
        headers=JSON_HEADERS,
        json={"parent_id": target_dir_id}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ File moved successfully!")
        print(f"   Content items: {len(data.get('content', []))}")
        return data
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_update_directory(dir_id: str, new_name: str):
    """Test updating directory name"""
    print(f"✏️  Testing directory update: {dir_id}...")
    
    response = requests.put(
        f"{SPACE_API}dir/{dir_id}/",
        headers=JSON_HEADERS,
        json={"name": new_name}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Directory updated!")
        print(f"   New name: {new_name}")
        return data
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_download_file(file_id: str):
    """Test downloading a file"""
    print(f"📥 Testing file download: {file_id}...")
    
    response = requests.get(f"{SPACE_API}file/{file_id}/", headers=HEADERS)
    
    if response.status_code == 200:
        content_length = len(response.content)
        content_type = response.headers.get('content-type', 'unknown')
        print(f"✅ File downloaded!")
        print(f"   Size: {content_length} bytes")
        print(f"   Type: {content_type}")
        return response.content
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_get_thumbnail(file_id: str):
    """Test getting file thumbnail"""
    print(f"🖼️  Testing thumbnail: {file_id}...")
    
    response = requests.get(f"{SPACE_API}file/{file_id}/thumbnail/", headers=HEADERS)
    
    if response.status_code == 200:
        content_length = len(response.content)
        print(f"✅ Thumbnail retrieved!")
        print(f"   Size: {content_length} bytes")
        return response.content
    elif response.status_code == 404:
        print("ℹ️  No thumbnail available (expected for non-image files)")
        return None
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_batch_thumbnails(file_ids: List[str]):
    """Test getting thumbnails in batch"""
    print(f"📸 Testing batch thumbnails for {len(file_ids)} files...")
    
    response = requests.post(
        f"{SPACE_API}thumbnails/batch/",
        headers=JSON_HEADERS,
        json={
            "file_ids": file_ids,
            "format": "url"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        thumbnails = data.get("thumbnails", [])
        print(f"✅ Batch thumbnails retrieved!")
        print(f"   Total requested: {data.get('total_requested', 0)}")
        print(f"   Total found: {data.get('total_found', 0)}")
        for thumb in thumbnails:
            if thumb.get("has_thumbnail"):
                print(f"   📷 {thumb.get('file_id')}: {thumb.get('thumbnail_url')}")
        return data
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return None

def test_error_handling():
    """Test error handling with invalid requests"""
    print("🚫 Testing error handling...")
    
    # Test invalid file ID
    response = requests.get(f"{SPACE_API}file/invalid_id/", headers=HEADERS)
    if response.status_code == 422 or response.status_code == 404:
        print("✅ Invalid file ID correctly rejected!")
    else:
        print(f"❌ Expected error for invalid file ID, got: {response.status_code}")
    
    # Test invalid directory ID
    response = requests.get(f"{SPACE_API}dir/invalid_id/", headers=HEADERS)
    if response.status_code == 422 or response.status_code == 404:
        print("✅ Invalid directory ID correctly rejected!")
    else:
        print(f"❌ Expected error for invalid directory ID, got: {response.status_code}")

def cleanup_files():
    """Delete all created files"""
    print("🗑️  Cleaning up files...")
    
    for file_id in created_files:
        try:
            response = requests.delete(f"{SPACE_API}file/{file_id}/", headers=HEADERS)
            if response.status_code == 200:
                print(f"✅ File {file_id} deleted")
            else:
                print(f"❌ Failed to delete file {file_id}: {response.status_code}")
        except Exception as e:
            print(f"❌ Error deleting file {file_id}: {str(e)}")

def cleanup_directories():
    """Delete all created directories"""
    print("🗂️  Cleaning up directories...")
    
    # Delete in reverse order (children first)
    for dir_id in reversed(created_dirs):
        try:
            response = requests.delete(f"{SPACE_API}dir/{dir_id}/", headers=HEADERS)
            if response.status_code == 200:
                print(f"✅ Directory {dir_id} deleted")
            else:
                print(f"❌ Failed to delete directory {dir_id}: {response.status_code}")
        except Exception as e:
            print(f"❌ Error deleting directory {dir_id}: {str(e)}")

def main():
    """Run all Space API tests"""
    print("Space API Test Suite")
    print("=" * 25)
    
    # Test space information
    print("\n🌌 Testing Space Information")
    print("-" * 30)
    test_get_space()
    
    # Test directory operations
    print("\n📁 Testing Directory Operations")
    print("-" * 35)
    dir_id = test_create_directory()
    if not dir_id:
        print("❌ Cannot continue without directory")
        return
    
    subdir_id = test_create_subdirectory(dir_id)
    test_get_directory_details(dir_id)
    
    # Test file operations
    print("\n📄 Testing File Operations")
    print("-" * 28)
    file_id = test_upload_file(dir_id)
    image_id = test_upload_image_file(subdir_id)
    
    if file_id:
        test_download_file(file_id)
        test_get_thumbnail(file_id)
    
    if image_id:
        test_get_thumbnail(image_id)
    
    # Test batch operations
    if file_id and image_id:
        print("\n📦 Testing Batch Operations")
        print("-" * 29)
        test_batch_thumbnails([file_id, image_id])
    
    # Test file manipulation
    if file_id and subdir_id:
        print("\n🔄 Testing File Manipulation")
        print("-" * 32)
        test_move_file(file_id, subdir_id)
    
    # Test directory updates
    if dir_id:
        print("\n✏️  Testing Directory Updates")
        print("-" * 33)
        test_update_directory(dir_id, "Updated Test Directory")
    
    # Test error handling
    print("\n🚫 Testing Error Handling")
    print("-" * 27)
    test_error_handling()
    
    # Final space check
    print("\n🌌 Final Space Check")
    print("-" * 21)
    test_get_space()
    
    # Cleanup
    cleanup = input("\nCleanup test files and directories? (Y/n): ").strip().lower()
    if cleanup != 'n':
        cleanup_files()
        cleanup_directories()
        print("✅ Cleanup completed!")
    else:
        print(f"💾 Test data preserved:")
        print(f"   Files: {len(created_files)}")
        print(f"   Directories: {len(created_dirs)}")
    
    print("\n🏁 Space API tests completed!")

if __name__ == "__main__":
    main() 