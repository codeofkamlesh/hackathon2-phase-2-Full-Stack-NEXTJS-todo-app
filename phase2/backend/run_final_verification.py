#!/usr/bin/env python3
"""
Final verification script to confirm all Todo App Phase II functionality is working.
This script validates that all the implemented features meet the requirements.
"""

import subprocess
import sys
import time
import threading
import signal
import os

def start_backend_server():
    """Start the backend server in a separate thread"""
    def run_server():
        global server_process
        server_process = subprocess.Popen([
            sys.executable, "-m", "uvicorn",
            "main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload"
        ], cwd="/mnt/e/Q4 hackathones/Todo-app-with-ai/phase2/backend")

        server_process.wait()

    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    return server_thread

def stop_backend_server():
    """Stop the backend server"""
    global server_process
    if server_process:
        server_process.terminate()
        server_process.wait(timeout=5)

def run_tests():
    """Run the comprehensive test suite"""
    print("🚀 Running comprehensive functionality tests...")

    # Change to the backend directory
    os.chdir("/mnt/e/Q4 hackathones/Todo-app-with-ai/phase2/backend")

    # Run the test script
    result = subprocess.run([sys.executable, "test_functionality.py"],
                          capture_output=True, text=True)

    print("STDOUT:", result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)

    return result.returncode == 0

def main():
    global server_process
    server_process = None

    print("🔍 Starting Final Verification for Todo App Phase II")
    print("=" * 60)

    try:
        # Start the backend server
        print("🔌 Starting backend server...")
        server_thread = start_backend_server()

        # Give the server time to start
        time.sleep(5)

        # Run the tests
        success = run_tests()

        if success:
            print("\n🎉 ALL TESTS PASSED! Todo App Phase II is fully functional.")
            print("✅ Neon PostgreSQL integration working")
            print("✅ Authentication system operational")
            print("✅ Task management system working")
            print("✅ Frontend-backend integration complete")
            print("✅ All requirements fulfilled")
        else:
            print("\n❌ SOME TESTS FAILED. Please check the output above.")
            return False

    except KeyboardInterrupt:
        print("\n⚠️  Verification interrupted by user.")
        return False
    except Exception as e:
        print(f"\n💥 Error during verification: {e}")
        return False
    finally:
        # Stop the server
        print("\n🛑 Stopping backend server...")
        stop_backend_server()

    print("\n✅ Final verification completed successfully!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)