from django.db import models
from customers.models import Customer
from employees.models import Employee
from rooms.models import Booking

class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Service Categories"

class Service(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, default='lần')  # lần, giờ, ngày, etc.
    is_available = models.BooleanField(default=True)
    # image = models.ImageField(upload_to='services/', null=True, blank=True)  # Requires Pillow
    image = models.CharField(max_length=255, null=True, blank=True, help_text="URL hoặc path của hình ảnh")
    
    def __str__(self):
        return f"{self.name} - {self.price:,.0f} VND/{self.unit}"

class ServiceOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Chờ xử lý'),
        ('confirmed', 'Đã xác nhận'),
        ('in_progress', 'Đang thực hiện'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ]
    
    order_id = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_time = models.DateTimeField()
    completed_time = models.DateTimeField(null=True, blank=True)
    assigned_employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='created_service_orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.order_id} - {self.service.name} - {self.customer.full_name}"
    
    def save(self, *args, **kwargs):
        if not self.unit_price:
            self.unit_price = self.service.price
        self.total_amount = self.unit_price * self.quantity
        super().save(*args, **kwargs)