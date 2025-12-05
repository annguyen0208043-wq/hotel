from django.db import models
from django.utils import timezone
from django.db.models import Sum, Count
from rooms.models import Booking, Room
from accounts.models import Account
from datetime import date, datetime, timedelta


class RevenueReport(models.Model):
    REPORT_TYPE_CHOICES = [
        ('daily', 'Hàng ngày'),
        ('weekly', 'Hàng tuần'), 
        ('monthly', 'Hàng tháng'),
        ('yearly', 'Hàng năm'),
    ]
    
    report_date = models.DateField()
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    room_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    service_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_bookings = models.IntegerField(default=0)
    total_guests = models.IntegerField(default=0)
    total_nights = models.IntegerField(default=0)
    occupancy_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Tỷ lệ lấp đầy phòng
    average_daily_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # ADR
    revenue_per_available_room = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # RevPAR
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['report_date', 'report_type']
        ordering = ['-report_date']
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.report_date} - {self.total_revenue:,.0f} VND"


class CustomerLoyalty(models.Model):
    """Khách hàng thân thiết"""
    customer = models.OneToOneField('customers.Customer', on_delete=models.CASCADE, related_name='loyalty')
    total_bookings = models.IntegerField(default=0)
    total_nights = models.IntegerField(default=0)
    total_spent = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    loyalty_points = models.IntegerField(default=0)
    tier = models.CharField(max_length=20, choices=[
        ('bronze', 'Đồng'),
        ('silver', 'Bạc'),
        ('gold', 'Vàng'),
        ('platinum', 'Bạch Kim')
    ], default='bronze')
    first_booking_date = models.DateTimeField(null=True, blank=True)
    last_booking_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def update_loyalty(self):
        """Cập nhật thông tin khách hàng thân thiết"""
        bookings = self.customer.bookings.filter(status='checked_out')
        self.total_bookings = bookings.count()
        self.total_nights = sum([(b.check_out_date - b.check_in_date).days for b in bookings])
        self.total_spent = sum([b.total_amount or 0 for b in bookings])
        
        # Tính points (1 đêm = 10 points, 1000 VND = 1 point)
        self.loyalty_points = self.total_nights * 10 + int(self.total_spent / 1000)
        
        # Xác định tier
        if self.loyalty_points >= 5000:
            self.tier = 'platinum'
        elif self.loyalty_points >= 2000:
            self.tier = 'gold'
        elif self.loyalty_points >= 500:
            self.tier = 'silver'
        else:
            self.tier = 'bronze'
            
        if bookings.exists():
            self.first_booking_date = bookings.order_by('check_in_date').first().check_in_date
            self.last_booking_date = bookings.order_by('check_out_date').last().check_out_date
            
        self.save()
    
    def __str__(self):
        return f"{self.customer.full_name} - {self.get_tier_display()} - {self.loyalty_points} points"

class PaymentMethod(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Payment(models.Model):
    PAYMENT_TYPE_CHOICES = [
        ('booking', 'Thanh toán đặt phòng'),
        ('service', 'Thanh toán dịch vụ'),
        ('deposit', 'Đặt cọc'),
        ('refund', 'Hoàn tiền'),
    ]
    
    payment_id = models.CharField(max_length=20, unique=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, null=True, blank=True)
    # service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, null=True, blank=True)  # Tạm comment
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.CASCADE)
    transaction_reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.payment_id} - {self.amount:,.0f} VND - {self.get_payment_type_display()}"