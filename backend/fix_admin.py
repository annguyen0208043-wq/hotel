#!/usr/bin/env python
import os
import django
from datetime import date

# Thiết lập Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotel_management.settings')
django.setup()

from accounts.models import Account, EmployeeProfile

def fix_admin_accounts():
    """Cập nhật tài khoản superuser thành admin với employee profile"""
    
    # Tìm tất cả superuser
    superusers = Account.objects.filter(is_superuser=True)
    
    for user in superusers:
        print(f"Đang xử lý user: {user.username}")
        
        # Cập nhật user_type thành admin
        user.user_type = 'admin'
        user.save()
        
        # Tạo hoặc cập nhật EmployeeProfile
        employee_profile, created = EmployeeProfile.objects.get_or_create(
            user=user,
            defaults={
                'employee_id': f'ADMIN{user.id:03d}',
                'position': 'manager',
                'shift': 'morning',
                'salary': 50000000,  # 50 triệu
                'hire_date': date.today()
            }
        )
        
        if created:
            print(f"✅ Đã tạo EmployeeProfile cho {user.username}")
            print(f"   - Employee ID: {employee_profile.employee_id}")
            print(f"   - Position: {employee_profile.position}")
        else:
            print(f"✅ EmployeeProfile đã tồn tại cho {user.username}")
        
        print(f"✅ Đã cập nhật {user.username} thành admin")
        print(f"   - Username: {user.username}")
        print(f"   - Email: {user.email}")
        print(f"   - User Type: {user.user_type}")
        print("---")
    
    print("\n🎉 Hoàn thành! Bây giờ bạn có thể:")
    print("1. Đăng nhập qua Employee Login với tài khoản superuser")
    print("2. Hoặc truy cập Django Admin: http://localhost:8000/admin/")

if __name__ == '__main__':
    fix_admin_accounts()