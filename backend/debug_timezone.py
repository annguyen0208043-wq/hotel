import sys
import os
import django

# Add the project root to the Python path
sys.path.append('/'.join(__file__.split('/')[:-1]))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotel_management.settings')

django.setup()

from rooms.models import Booking
from datetime import date
from django.utils import timezone

print("=== TEST TIMEZONE CHECKOUT ===")

# Test timezone aware query
booking = Booking.objects.get(booking_id='TEST001')
print(f"TEST001 checkout time: {booking.actual_check_out}")
print(f"Local date of checkout: {booking.actual_check_out.date()}")
print(f"Today's date: {date.today()}")
print(f"Match? {booking.actual_check_out.date() == date.today()}")

# Test query
checkout_today = Booking.objects.filter(
    actual_check_out__date=date.today(),
    status='checked_out',
    paid_amount__gt=0
)
print(f"Found {checkout_today.count()} bookings checkout today")

# Manually trigger signal
print("\n=== MANUALLY TRIGGER REVENUE UPDATE ===")
from revenue.signals import update_daily_revenue
update_daily_revenue(booking.actual_check_out.date())