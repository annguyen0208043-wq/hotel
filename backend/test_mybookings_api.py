import sys
import os
import django
import requests

# Add the project root to the Python path
sys.path.append('/'.join(__file__.split('/')[:-1]))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotel_management.settings')

django.setup()

from accounts.models import Account

print("=== TEST MY_BOOKINGS API ===")

# Find a customer to test with
customer = Account.objects.filter(user_type='customer').first()
if not customer:
    print("❌ No customer found in database")
    exit()

print(f"Testing with customer: {customer.username}")

# Get session / auth (simplified test)
try:
    # First, just test the endpoint without auth
    response = requests.get("http://localhost:8000/api/rooms/bookings/my_bookings/")
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text[:500]}...")  # First 500 chars
    
    if response.status_code == 200:
        import json
        data = response.json()
        print(f"Data type: {type(data)}")
        print(f"Data structure: {json.dumps(data, indent=2)[:500]}...")
        
        if isinstance(data, list):
            print(f"✅ Response is a list with {len(data)} items")
        elif isinstance(data, dict):
            print(f"❌ Response is a dict with keys: {list(data.keys())}")
        
except requests.exceptions.ConnectionError:
    print("❌ Could not connect to Django server. Make sure it's running on localhost:8000")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()