import sys
import os
import django
import requests
import json

# Add the project root to the Python path
sys.path.append('/'.join(__file__.split('/')[:-1]))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotel_management.settings')

django.setup()

from accounts.models import Account
from rooms.models import Room, RoomType

print("=== TEST BOOKING CREATION ===")

# Test data for booking creation
booking_data = {
    "customer": 1,  # Assuming customer with id=1 exists
    "room": 1,      # Assuming room with id=1 exists  
    "check_in_date": "2025-12-06",
    "check_out_date": "2025-12-08",
    "adults": 2,
    "children": 0,
    "total_amount": "1500000.00",
    "paid_amount": "1500000.00",
    "status": "confirmed"
}

print(f"Test booking data: {json.dumps(booking_data, indent=2)}")

# Check if required objects exist
try:
    customer = Account.objects.filter(user_type='customer').first()
    room = Room.objects.first()
    
    if not customer:
        print("❌ No customer found")
    else:
        print(f"✅ Customer found: {customer.username} (ID: {customer.id})")
        booking_data["customer"] = customer.id
    
    if not room:
        print("❌ No room found") 
    else:
        print(f"✅ Room found: {room.room_number} (ID: {room.id})")
        booking_data["room"] = room.id
    
    print(f"\nFinal booking data: {json.dumps(booking_data, indent=2)}")
    
    # Test API call locally
    try:
        response = requests.post(
            "http://localhost:8000/api/rooms/bookings/",
            json=booking_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\nAPI Response Status: {response.status_code}")
        print(f"API Response Headers: {dict(response.headers)}")
        print(f"API Response Body: {response.text}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Django server. Make sure it's running on localhost:8000")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()