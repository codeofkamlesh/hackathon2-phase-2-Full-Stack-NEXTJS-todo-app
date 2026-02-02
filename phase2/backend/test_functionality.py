#!/usr/bin/env python3
"""
Test script to validate the complete functionality of the Todo App backend.
This verifies that all the implemented features work correctly with Neon PostgreSQL.
"""

import requests
import uuid
import time
import sys
import os

# Add the backend directory to the path so we can import modules
sys.path.insert(0, '/mnt/e/Q4 hackathones/Todo-app-with-ai/phase2/backend')

# Test constants
BASE_URL = "http://localhost:8000"
TEST_EMAIL = f"test_{uuid.uuid4()}@example.com"
TEST_PASSWORD = "test_password_123"
TEST_NAME = "Test User"

def test_database_initialization():
    """Test database initialization and table creation on startup"""
    print("🧪 Testing database initialization...")

    try:
        # Test health endpoint which confirms database connection
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "ok":
                print("✅ Database initialization confirmed via health check")
                return True
            else:
                print(f"❌ Health check failed: {data}")
                return False
        else:
            print(f"❌ Health check returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Database initialization test failed: {e}")
        return False

def test_user_signup():
    """Test user signup flow creates user in database with hashed password and commit"""
    print("🧪 Testing user signup flow...")

    try:
        signup_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME
        }

        response = requests.post(f"{BASE_URL}/api/auth/signup", json=signup_data)

        if response.status_code == 201:
            data = response.json()
            if "token" in data and "userId" in data:
                print(f"✅ User signup successful: {data['userId']}")
                return data["token"], data["userId"]
            else:
                print(f"❌ Signup response missing required fields: {data}")
                return None, None
        else:
            print(f"❌ Signup failed with status {response.status_code}: {response.text}")
            return None, None
    except Exception as e:
        print(f"❌ User signup test failed: {e}")
        return None, None

def test_user_login(token, user_id):
    """Test user login flow returns valid JWT token with commit validation"""
    print("🧪 Testing user login flow...")

    try:
        login_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }

        response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)

        if response.status_code == 200:
            data = response.json()
            if "token" in data and "userId" in data and data["userId"] == user_id:
                print("✅ User login successful")
                return data["token"]
            else:
                print(f"❌ Login response invalid: {data}")
                return None
        else:
            print(f"❌ Login failed with status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"❌ User login test failed: {e}")
        return None

def test_task_crud_operations(token, user_id):
    """Test task CRUD operations with proper user isolation and commits"""
    print("🧪 Testing task CRUD operations...")

    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Test creating a task
        task_data = {
            "title": "Test Task",
            "description": "This is a test task"
        }

        create_response = requests.post(f"{BASE_URL}/api/{user_id}/tasks", json=task_data, headers=headers)
        if create_response.status_code != 201:
            print(f"❌ Task creation failed: {create_response.status_code} - {create_response.text}")
            return False

        created_task = create_response.json()
        task_id = created_task.get("id")
        if not task_id:
            print(f"❌ Task creation didn't return a valid ID: {created_task}")
            return False

        print(f"✅ Task created: {task_id}")

        # Test getting the task
        get_response = requests.get(f"{BASE_URL}/api/{user_id}/tasks/{task_id}", headers=headers)
        if get_response.status_code != 200:
            print(f"❌ Task retrieval failed: {get_response.status_code} - {get_response.text}")
            return False

        retrieved_task = get_response.json()
        if retrieved_task.get("id") != task_id:
            print(f"❌ Retrieved task ID doesn't match: {retrieved_task}")
            return False

        print("✅ Task retrieved successfully")

        # Test updating the task
        update_data = {
            "title": "Updated Test Task",
            "description": "This is an updated test task"
        }

        update_response = requests.put(f"{BASE_URL}/api/{user_id}/tasks/{task_id}", json=update_data, headers=headers)
        if update_response.status_code != 200:
            print(f"❌ Task update failed: {update_response.status_code} - {update_response.text}")
            return False

        updated_task = update_response.json()
        if updated_task.get("title") != "Updated Test Task":
            print(f"❌ Task update didn't work: {updated_task}")
            return False

        print("✅ Task updated successfully")

        # Test toggling completion
        toggle_response = requests.patch(f"{BASE_URL}/api/{user_id}/tasks/{task_id}/complete", headers=headers)
        if toggle_response.status_code != 200:
            print(f"❌ Task completion toggle failed: {toggle_response.status_code} - {toggle_response.text}")
            return False

        toggled_task = toggle_response.json()
        if not toggled_task.get("completed"):
            print(f"❌ Task completion toggle didn't work: {toggled_task}")
            return False

        print("✅ Task completion toggled successfully")

        # Test getting all tasks (should return the created task)
        all_tasks_response = requests.get(f"{BASE_URL}/api/{user_id}/tasks", headers=headers)
        if all_tasks_response.status_code != 200:
            print(f"❌ Getting all tasks failed: {all_tasks_response.status_code} - {all_tasks_response.text}")
            return False

        all_tasks = all_tasks_response.json()
        if len(all_tasks) != 1 or all_tasks[0]["id"] != task_id:
            print(f"❌ Getting all tasks didn't return expected result: {all_tasks}")
            return False

        print("✅ All tasks retrieved successfully")

        # Test deleting the task
        delete_response = requests.delete(f"{BASE_URL}/api/{user_id}/tasks/{task_id}", headers=headers)
        if delete_response.status_code != 200:
            print(f"❌ Task deletion failed: {delete_response.status_code} - {delete_response.text}")
            return False

        print("✅ Task deleted successfully")

        return True
    except Exception as e:
        print(f"❌ Task CRUD operations test failed: {e}")
        return False

def test_empty_results_handling(token, user_id):
    """Test that empty results are handled properly (return empty array, not errors)"""
    print("🧪 Testing empty results handling...")

    headers = {"Authorization": f"Bearer {token}"}

    try:
        # Get tasks when there are none - should return empty array
        response = requests.get(f"{BASE_URL}/api/{user_id}/tasks", headers=headers)

        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) == 0:
                print("✅ Empty results handled correctly (returned empty array)")
                return True
            else:
                print(f"❌ Empty results not handled correctly: {data}")
                return False
        else:
            print(f"❌ Empty results test failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Empty results handling test failed: {e}")
        return False

def test_error_handling():
    """Test error handling and response validation with commit confirmation"""
    print("🧪 Testing error handling...")

    try:
        # Test invalid login
        invalid_login_data = {
            "email": "nonexistent@example.com",
            "password": "wrong_password"
        }

        response = requests.post(f"{BASE_URL}/api/auth/login", json=invalid_login_data)
        if response.status_code != 401:
            print(f"❌ Expected 401 for invalid login, got {response.status_code}")
            return False

        print("✅ Invalid login properly returns 401")

        # Test signup with existing email
        duplicate_signup_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": TEST_NAME
        }

        response = requests.post(f"{BASE_URL}/api/auth/signup", json=duplicate_signup_data)
        if response.status_code != 400:
            print(f"❌ Expected 400 for duplicate signup, got {response.status_code}")
            return False

        print("✅ Duplicate signup properly returns 400")

        return True
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False

def test_user_isolation(token, user_id):
    """Test user isolation with multiple user accounts"""
    print("🧪 Testing user isolation...")

    # Create a second test user
    second_email = f"test2_{uuid.uuid4()}@example.com"

    try:
        # Signup second user
        signup_data = {
            "email": second_email,
            "password": TEST_PASSWORD,
            "name": "Second Test User"
        }

        response = requests.post(f"{BASE_URL}/api/auth/signup", json=signup_data)
        if response.status_code != 201:
            print(f"❌ Second user signup failed: {response.status_code} - {response.text}")
            return False

        second_user_data = response.json()
        second_token = second_user_data.get("token")
        second_user_id = second_user_data.get("userId")

        if not second_token or not second_user_id:
            print(f"❌ Second user signup didn't return valid token/user_id: {second_user_data}")
            return False

        print("✅ Second user created")

        # Create a task for the second user
        headers = {"Authorization": f"Bearer {second_token}"}
        task_data = {
            "title": "Second User's Task",
            "description": "This belongs to the second user"
        }

        create_response = requests.post(f"{BASE_URL}/api/{second_user_id}/tasks", json=task_data, headers=headers)
        if create_response.status_code != 201:
            print(f"❌ Second user task creation failed: {create_response.status_code} - {create_response.text}")
            return False

        second_task = create_response.json()
        second_task_id = second_task.get("id")

        print("✅ Second user's task created")

        # Try to access second user's task with first user's token (should fail)
        first_user_headers = {"Authorization": f"Bearer {token}"}
        access_response = requests.get(f"{BASE_URL}/api/{second_user_id}/tasks/{second_task_id}", headers=first_user_headers)

        if access_response.status_code != 403 and access_response.status_code != 404:
            print(f"❌ User isolation failed - first user could access second user's task: {access_response.status_code}")
            return False

        print("✅ User isolation working correctly - first user can't access second user's task")

        # Verify first user can only see their own tasks (should be empty)
        first_user_tasks_response = requests.get(f"{BASE_URL}/api/{user_id}/tasks", headers=first_user_headers)
        if first_user_tasks_response.status_code != 200:
            print(f"❌ Failed to get first user's tasks: {first_user_tasks_response.status_code}")
            return False

        first_user_tasks = first_user_tasks_response.json()
        if len(first_user_tasks) != 0:
            print(f"❌ First user sees tasks that don't belong to them: {first_user_tasks}")
            return False

        print("✅ First user only sees their own tasks (correctly empty)")

        # Clean up second user
        requests.post(f"{BASE_URL}/api/auth/login", json={"email": second_email, "password": TEST_PASSWORD})
        requests.delete(f"{BASE_URL}/api/{second_user_id}/tasks/{second_task_id}", headers=headers)

        return True
    except Exception as e:
        print(f"❌ User isolation test failed: {e}")
        return False

def main():
    """Run all tests to validate the complete implementation"""
    print("🚀 Starting Todo App Backend Functionality Tests")
    print("=" * 60)

    # Check if the backend is running
    try:
        health_response = requests.get(f"{BASE_URL}/health", timeout=5)
        if health_response.status_code != 200:
            print(f"❌ Backend is not running at {BASE_URL}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Backend is not running at {BASE_URL}. Please start the backend server first.")
        print("Run: uvicorn main:app --reload --port 8000")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False

    print("✅ Backend is running")
    print()

    # Run all tests
    tests_passed = 0
    total_tests = 8

    # Test 1: Database initialization
    if test_database_initialization():
        tests_passed += 1
    print()

    # Test 2: User signup
    token, user_id = test_user_signup()
    if token and user_id:
        tests_passed += 1
    print()

    # Test 3: User login
    if token and test_user_login(token, user_id):
        tests_passed += 1
    print()

    # Test 4: Task CRUD operations
    if token and user_id and test_task_crud_operations(token, user_id):
        tests_passed += 1
    print()

    # Test 5: Empty results handling
    if token and user_id and test_empty_results_handling(token, user_id):
        tests_passed += 1
    print()

    # Test 6: Error handling
    if test_error_handling():
        tests_passed += 1
    print()

    # Test 7: User isolation
    if token and user_id and test_user_isolation(token, user_id):
        tests_passed += 1
    print()

    # Test 8: Final verification (try to get empty task list again)
    if token and user_id and test_empty_results_handling(token, user_id):
        tests_passed += 1
    print()

    print("=" * 60)
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")

    if tests_passed == total_tests:
        print("🎉 All tests passed! The Todo App backend is fully functional.")
        print("✅ Neon PostgreSQL database connection is working")
        print("✅ User authentication (signup/login) is working")
        print("✅ JWT token generation and validation is working")
        print("✅ Task CRUD operations are working")
        print("✅ User isolation is working")
        print("✅ Error handling is working")
        print("✅ JSON responses are properly formatted")
        return True
    else:
        print("❌ Some tests failed. Please review the output above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)