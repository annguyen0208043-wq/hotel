from django.db import models
from django.utils import timezone
from rooms.models import Booking
from services.models import ServiceOrder

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
    total_service_orders = models.IntegerField(default=0)
    occupancy_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Tỷ lệ lấp đầy phòng
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['report_date', 'report_type']
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.report_date} - {self.total_revenue:,.0f} VND"

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
    service_order = models.ForeignKey(ServiceOrder, on_delete=models.CASCADE, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.CASCADE)
    transaction_reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.payment_id} - {self.amount:,.0f} VND - {self.get_payment_type_display()}"