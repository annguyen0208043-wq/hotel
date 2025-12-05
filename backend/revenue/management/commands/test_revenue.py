from django.core.management.base import BaseCommand
from django.utils import timezone
from rooms.models import Booking, Room, RoomType
from accounts.models import Account
from revenue.models import RevenueReport, Payment, PaymentMethod
from decimal import Decimal
from datetime import date, timedelta
import uuid

class Command(BaseCommand):
    help = 'Tạo dữ liệu mẫu và test checkout để cập nhật doanh thu'

    def add_arguments(self, parser):
        parser.add_argument(
            '--test-checkout',
            action='store_true',
            help='Test checkout booking để kiểm tra cập nhật doanh thu',
        )
        parser.add_argument(
            '--create-sample',
            action='store_true',
            help='Tạo dữ liệu mẫu booking',
        )

    def handle(self, *args, **options):
        if options['create_sample']:
            self.create_sample_data()
        
        if options['test_checkout']:
            self.test_checkout_process()

    def create_sample_data(self):
        """Tạo dữ liệu mẫu để test"""
        self.stdout.write('Tạo dữ liệu mẫu...')
        
        # Tạo customer nếu chưa có
        customer, created = Account.objects.get_or_create(
            username='customer_test',
            defaults={
                'first_name': 'Khách',
                'last_name': 'Test',
                'email': 'customer@test.com',
                'user_type': 'customer',
                'phone_number': '0123456789'
            }
        )
        if created:
            customer.set_password('password123')
            customer.save()
            self.stdout.write(f'✅ Tạo customer: {customer.username}')
        
        # Tạo room type nếu chưa có
        room_type, created = RoomType.objects.get_or_create(
            name='Deluxe',
            defaults={
                'description': 'Phòng cao cấp',
                'price_per_night': Decimal('1000000'),
                'max_occupancy': 2,
                'amenities': 'WiFi, TV, Điều hòa, Minibar'
            }
        )
        if created:
            self.stdout.write(f'✅ Tạo room type: {room_type.name}')
        
        # Tạo room nếu chưa có
        room, created = Room.objects.get_or_create(
            room_number='101',
            defaults={
                'room_type': room_type,
                'floor': 1,
                'status': 'available'
            }
        )
        if created:
            self.stdout.write(f'✅ Tạo room: {room.room_number}')
        
        # Tạo booking mẫu
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        booking, created = Booking.objects.get_or_create(
            booking_id='TEST001',
            defaults={
                'customer': customer,
                'room': room,
                'check_in_date': yesterday,
                'check_out_date': today,
                'actual_check_in': timezone.now() - timedelta(days=1),
                'adults': 2,
                'children': 0,
                'total_amount': Decimal('1000000'),
                'paid_amount': Decimal('1000000'),
                'status': 'checked_in',
            }
        )
        if created:
            self.stdout.write(f'✅ Tạo booking: {booking.booking_id}')
        else:
            self.stdout.write(f'📋 Booking đã tồn tại: {booking.booking_id}')
        
        self.stdout.write(self.style.SUCCESS('Hoàn thành tạo dữ liệu mẫu!'))

    def test_checkout_process(self):
        """Test quá trình checkout và cập nhật doanh thu"""
        self.stdout.write('Bắt đầu test checkout process...')
        
        # Tìm booking có thể checkout
        booking = Booking.objects.filter(
            status='checked_in',
            booking_id='TEST001'
        ).first()
        
        if not booking:
            self.stdout.write(self.style.ERROR('Không tìm thấy booking để test checkout!'))
            return
        
        # Hiển thị trạng thái trước checkout
        self.stdout.write(f'📋 Booking: {booking.booking_id}')
        self.stdout.write(f'💰 Số tiền: {booking.paid_amount:,} VND')
        self.stdout.write(f'📅 Check-out date: {booking.check_out_date}')
        
        # Kiểm tra revenue report trước checkout
        today = date.today()
        report_before = RevenueReport.objects.filter(
            report_date=today,
            report_type='daily'
        ).first()
        
        revenue_before = report_before.total_revenue if report_before else 0
        self.stdout.write(f'💹 Doanh thu trước checkout: {revenue_before:,} VND')
        
        # Thực hiện checkout
        booking.status = 'checked_out'
        booking.actual_check_out = timezone.now()
        booking.save()
        
        self.stdout.write('✅ Đã checkout booking!')
        
        # Kiểm tra revenue report sau checkout
        report_after = RevenueReport.objects.filter(
            report_date=today,
            report_type='daily'
        ).first()
        
        revenue_after = report_after.total_revenue if report_after else 0
        self.stdout.write(f'💹 Doanh thu sau checkout: {revenue_after:,} VND')
        self.stdout.write(f'📈 Tăng thêm: {revenue_after - revenue_before:,} VND')
        
        # Kiểm tra payment record
        payment = Payment.objects.filter(booking=booking).first()
        if payment:
            self.stdout.write(f'💳 Payment record: {payment.payment_id} - {payment.amount:,} VND')
        else:
            self.stdout.write(self.style.WARNING('⚠️ Chưa có payment record được tạo!'))
        
        # Hiển thị chi tiết revenue report
        if report_after:
            self.stdout.write('\n📊 Chi tiết Revenue Report:')
            self.stdout.write(f'   - Room Revenue: {report_after.room_revenue:,} VND')
            self.stdout.write(f'   - Service Revenue: {report_after.service_revenue:,} VND') 
            self.stdout.write(f'   - Total Revenue: {report_after.total_revenue:,} VND')
            self.stdout.write(f'   - Total Bookings: {report_after.total_bookings}')
            self.stdout.write(f'   - Total Guests: {report_after.total_guests}')
            self.stdout.write(f'   - Occupancy Rate: {report_after.occupancy_rate:.1f}%')
        
        self.stdout.write(self.style.SUCCESS('\n✅ Test checkout hoàn thành!'))