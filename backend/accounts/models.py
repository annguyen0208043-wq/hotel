from django.contrib.auth.models import AbstractUser
from django.db import models

class Account(AbstractUser):
    USER_TYPES = (
        ('admin', 'Admin'),
        ('employee', 'Employee'),
        ('customer', 'Customer'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='customer')
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    avatar = models.CharField(max_length=255, blank=True, null=True, help_text="URL hoặc path của avatar")
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
    
    class Meta:
        db_table = 'accounts_account'

class CustomerProfile(models.Model):
    user = models.OneToOneField(Account, on_delete=models.CASCADE, related_name='customer_profile')
    id_card_number = models.CharField(max_length=20, unique=True, blank=True)
    nationality = models.CharField(max_length=50, default='Vietnam')
    emergency_contact = models.CharField(max_length=15, blank=True)
    is_vip = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Customer: {self.user.get_full_name()}"
    
    class Meta:
        db_table = 'accounts_customer_profile'

class EmployeeProfile(models.Model):
    POSITIONS = (
        ('manager', 'Quản lý'),
        ('receptionist', 'Lễ tân'),
        ('housekeeping', 'Nhân viên dọn phòng'),
        ('security', 'Bảo vệ'),
        ('accountant', 'Kế toán'),
        ('maintenance', 'Bảo trì'),
    )
    
    SHIFTS = (
        ('morning', 'Ca sáng (6:00-14:00)'),
        ('afternoon', 'Ca chiều (14:00-22:00)'),
        ('night', 'Ca đêm (22:00-6:00)'),
    )
    
    user = models.OneToOneField(Account, on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField(max_length=10, unique=True)
    position = models.CharField(max_length=20, choices=POSITIONS)
    department = models.CharField(max_length=50, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shift = models.CharField(max_length=20, choices=SHIFTS, default='morning')
    hire_date = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"Employee: {self.user.get_full_name()} - {self.get_position_display()}"
    
    class Meta:
        db_table = 'accounts_employee_profile'
