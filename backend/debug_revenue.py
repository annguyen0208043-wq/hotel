import sys
import os
import django

# Add the project root to the Python path
sys.path.append('/'.join(__file__.split('/')[:-1]))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotel_management.settings')

django.setup()

from rooms.models import Booking
from revenue.models import RevenueReport
from datetime import date

print("=== DEBUG REVENUE SYSTEM ===")

# Check all bookings
bookings = Booking.objects.all()
print(f"Total bookings: {bookings.count()}")

for booking in bookings:
    print(f"  {booking.booking_id}: {booking.status} - Paid: {booking.paid_amount:,} - Checkout: {booking.actual_check_out}")

# Check revenue reports
reports = RevenueReport.objects.all()
print(f"\nTotal revenue reports: {reports.count()}")

for report in reports:
    print(f"  {report.report_date} ({report.report_type}): {report.total_revenue:,} VND")

# Check today's checkout bookings
today_checkouts = Booking.objects.filter(
    actual_check_out__date=date.today(),
    status='checked_out'
)
print(f"\nToday's checkout bookings: {today_checkouts.count()}")
for booking in today_checkouts:
    print(f"  {booking.booking_id}: {booking.paid_amount:,} VND")