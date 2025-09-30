from django.db import models
from customers.models import Customer
from employees.models import Employee

class RoomType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    max_occupancy = models.IntegerField()
    amenities = models.TextField(help_text="Danh sách tiện nghi, phân tách bằng dấu phẩy")
    
    def __str__(self):
        return self.name

class Room(models.Model):
    STATUS_CHOICES = [
        ('available', 'Trống'),
        ('occupied', 'Đang sử dụng'),
        ('maintenance', 'Bảo trì'),
        ('cleaning', 'Đang dọn dẹp'),
        ('reserved', 'Đã đặt'),
    ]
    
    room_number = models.CharField(max_length=10, unique=True)
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE)
    floor = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    is_active = models.BooleanField(default=True)
    last_cleaned = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"Phòng {self.room_number} - {self.room_type.name}"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Chờ xác nhận'),
        ('confirmed', 'Đã xác nhận'),
        ('checked_in', 'Đã check-in'),
        ('checked_out', 'Đã check-out'),
        ('cancelled', 'Đã hủy'),
    ]
    
    booking_id = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    actual_check_in = models.DateTimeField(null=True, blank=True)
    actual_check_out = models.DateTimeField(null=True, blank=True)
    adults = models.IntegerField(default=1)
    children = models.IntegerField(default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    special_requests = models.TextField(blank=True)
    created_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.booking_id} - {self.customer.full_name} - Phòng {self.room.room_number}"
    
    @property
    def nights(self):
        return (self.check_out_date - self.check_in_date).days
    
    @property
    def is_paid(self):
        return self.paid_amount >= self.total_amount