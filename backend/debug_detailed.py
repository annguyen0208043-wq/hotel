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

print("=== DETAILED CHECKOUT DEBUG ===")

# Get all checked out bookings
checkout_bookings = Booking.objects.filter(status='checked_out')
print(f"Total checkout bookings: {checkout_bookings.count()}")

for booking in checkout_bookings:
    print(f"\n{booking.booking_id}:")
    print(f"  Status: {booking.status}")
    print(f"  Paid amount: {booking.paid_amount}")
    print(f"  Actual checkout: {booking.actual_check_out}")
    if booking.actual_check_out:
        print(f"  Checkout date: {booking.actual_check_out.date()}")
        print(f"  Is today? {booking.actual_check_out.date() == date.today()}")
    print(f"  Paid > 0? {booking.paid_amount > 0}")

# Test each filter condition
print(f"\n=== FILTER CONDITIONS ===")
print(f"Status checkout: {Booking.objects.filter(status='checked_out').count()}")
print(f"Has actual_checkout: {Booking.objects.filter(actual_check_out__isnull=False).count()}")
print(f"Paid > 0: {Booking.objects.filter(paid_amount__gt=0).count()}")
print(f"Checkout today: {Booking.objects.filter(actual_check_out__date=date.today()).count()}")
print(f"All conditions: {Booking.objects.filter(actual_check_out__date=date.today(), status='checked_out', paid_amount__gt=0).count()}")