import subprocess
import sys
import time
import requests
import json

def check_backend_status():
    print("🔍 Checking Backend Status...")
    print("=" * 50)
    
    # Check if Flask process is running
    try:
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq python.exe'], 
                              capture_output=True, text=True)
        if 'python.exe' in result.stdout:
            print("✅ Python process is running")
        else:
            print("❌ No Python process found")
            print("💡 Start the server with: python app.py")
            return False
    except Exception as e:
        print(f"❌ Error checking process: {e}")
    
    # Test endpoints
    endpoints = [
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'http://192.168.1.10:5000'
    ]
    
    print("\n🌐 Testing Endpoints:")
    working_endpoints = []
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {endpoint} - SUCCESS")
                print(f"   Response: {data.get('message', 'No message')}")
                working_endpoints.append(endpoint)
            else:
                print(f"❌ {endpoint} - HTTP {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"❌ {endpoint} - Connection refused")
        except requests.exceptions.Timeout:
            print(f"❌ {endpoint} - Timeout")
        except Exception as e:
            print(f"❌ {endpoint} - Error: {e}")
    
    # Test prediction endpoint
    if working_endpoints:
        print(f"\n🧪 Testing Prediction Endpoint:")
        test_data = {
            "FFMC": 85.6,
            "DMC": 26.2,
            "DC": 94.3,
            "ISI": 5.1,
            "temp": 32.0,
            "RH": 25.0,
            "wind": 15.0,
            "rain": 0.2,
            "month": 8,
            "day": 6
        }
        
        try:
            response = requests.post(f"{working_endpoints[0]}/predict", 
                                   json=test_data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Prediction endpoint works!")
                print(f"   Risk Level: {result.get('risk_level', 'Unknown')}")
                print(f"   Risk Score: {result.get('risk_score', 'Unknown')}")
            else:
                print(f"❌ Prediction failed - HTTP {response.status_code}")
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"❌ Prediction test failed: {e}")
    
    print(f"\n📊 Summary:")
    print(f"   Working endpoints: {len(working_endpoints)}")
    print(f"   Backend status: {'✅ HEALTHY' if working_endpoints else '❌ NOT WORKING'}")
    
    if not working_endpoints:
        print(f"\n💡 Troubleshooting:")
        print(f"   1. Make sure you ran: python app.py")
        print(f"   2. Check if the terminal shows: 'Running on http://0.0.0.0:5000'")
        print(f"   3. Try restarting the server")
    
    return len(working_endpoints) > 0

if __name__ == "__main__":
    check_backend_status()
    input("\nPress Enter to exit...")
