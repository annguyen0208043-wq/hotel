from django.db import models
from django.contrib.auth import get_user_model
from rooms.models import Booking, Room

Account = get_user_model()

class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='star', help_text="Icon class name")
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Service Categories"
        ordering = ['sort_order', 'name']

class Service(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='services')
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, default='món')  # món, giờ, lần, etc.
    is_available = models.BooleanField(default=True)
    preparation_time = models.IntegerField(default=15, help_text="Thời gian chuẩn bị (phút)")
    image = models.CharField(max_length=255, null=True, blank=True, help_text="URL hình ảnh")
    
    def __str__(self):
        return f"{self.name} - {self.price:,.0f} VND/{self.unit}"
    
    class Meta:
        ordering = ['category__sort_order', 'name']

# Model mới: Đơn hàng dịch vụ cho từng phòng
class RoomServiceOrder(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Chưa thanh toán'),
        ('paid', 'Đã thanh toán'),
        ('partial', 'Thanh toán một phần'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Chờ xử lý'),
        ('confirmed', 'Đã xác nhận'),
        ('preparing', 'Đang chuẩn bị'),
        ('ready', 'Sẵn sàng'),
        ('delivered', 'Đã giao'),
        ('cancelled', 'Đã hủy'),
    ]
    
    order_id = models.CharField(max_length=20, unique=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    customer = models.ForeignKey(Account, on_delete=models.CASCADE, limit_choices_to={'user_type': 'customer'})
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    
    assigned_employee = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True,
                                        limit_choices_to={'user_type__in': ['employee', 'admin']},
                                        related_name='assigned_service_orders')
    created_by = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True,
                                 limit_choices_to={'user_type__in': ['employee', 'admin']},
                                 related_name='created_service_orders')
    
    ordered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.order_id} - Phòng {self.room.room_number} - {self.customer.get_full_name()}"
    
    @property
    def is_paid(self):
        return self.paid_amount >= self.total_amount
    
    @property 
    def customer_name(self):
        return self.customer.get_full_name()
    
    @property
    def room_number(self):
        return self.room.room_number
    
    class Meta:
        ordering = ['-ordered_at']

# Model chi tiết từng item trong đơn hàng
class RoomServiceItem(models.Model):
    order = models.ForeignKey(RoomServiceOrder, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, help_text="Ghi chú đặc biệt cho món này")
    
    def __str__(self):
        return f"{self.service.name} x{self.quantity}"
    
    def save(self, *args, **kwargs):
        if not self.unit_price:
            self.unit_price = self.service.price
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)
        
        # Cập nhật tổng tiền của order
        self.order.total_amount = self.order.items.aggregate(
            total=models.Sum('total_price')
        )['total'] or 0
        self.order.save()

# Keep old models for backward compatibility
class ServiceOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Chờ xử lý'),
        ('confirmed', 'Đã xác nhận'),
        ('in_progress', 'Đang thực hiện'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ]
    
    order_id = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Account, on_delete=models.CASCADE, 
                                limit_choices_to={'user_type': 'customer'},
                                related_name='service_orders')
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, null=True, blank=True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_time = models.DateTimeField()
    completed_time = models.DateTimeField(null=True, blank=True)
    assigned_employee = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True,
                                        limit_choices_to={'user_type__in': ['employee', 'admin']},
                                        related_name='assigned_service_orders_old')
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, 
                                 related_name='created_service_orders_old',
                                 limit_choices_to={'user_type__in': ['employee', 'admin']})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.order_id} - {self.service.name} - {self.customer.full_name}"
    
    def save(self, *args, **kwargs):
        if not self.unit_price:
            self.unit_price = self.service.price
        self.total_amount = self.unit_price * self.quantity
        super().save(*args, **kwargs)