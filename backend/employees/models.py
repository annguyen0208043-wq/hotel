from django.db import models
from django.contrib.auth.models import AbstractUser

class Employee(AbstractUser):
    POSITION_CHOICES = [
        ('manager', 'Quản lý'),
        ('receptionist', 'Lễ tân'),
        ('housekeeper', 'Nhân viên dọn phòng'),
        ('security', 'Bảo vệ'),
        ('maintenance', 'Bảo trì'),
        ('accountant', 'Kế toán'),
    ]
    
    SHIFT_CHOICES = [
        ('morning', 'Ca sáng (6:00-14:00)'),
        ('afternoon', 'Ca chiều (14:00-22:00)'),
        ('night', 'Ca đêm (22:00-6:00)'),
    ]
    
    employee_id = models.CharField(max_length=20, unique=True, default="")
    phone = models.CharField(max_length=15, default="")
    address = models.TextField(default="")
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, default="receptionist")
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, default="morning")
    hire_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    # Fix reverse accessor conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name="employee_set",
        related_query_name="employee",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="employee_set",
        related_query_name="employee",
    )
    
    def __str__(self):
        return f"{self.get_full_name()} - {self.get_position_display()}"