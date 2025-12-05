#!/usr/bin/env python
import os
import django

# Thiết lập Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hotel_management.settings')
django.setup()

from accounts.models import Account, CustomerProfile

def update_verification_status():
    """Cập nhật trạng thái xác thực dựa trên việc có CCCD"""
    
    print("🔄 Đang cập nhật trạng thái xác thực cho khách hàng...")
    
    customers = Account.objects.filter(user_type='customer')
    updated_count = 0
    
    for customer in customers:
        old_verified = customer.is_verified
        
        # Kiểm tra xem có CustomerProfile và CCCD không
        has_cccd = False
        if hasattr(customer, 'customer_profile'):
            cccd = customer.customer_profile.id_card_number
            if cccd and len(cccd.strip()) > 0:
                has_cccd = True
        
        # Cập nhật trạng thái xác thực
        customer.is_verified = has_cccd
        customer.save()
        
        if old_verified != customer.is_verified:
            updated_count += 1
            print(f"✅ Cập nhật {customer.username}: {old_verified} → {customer.is_verified}")
    
    print(f"\n🎉 Hoàn thành! Đã cập nhật {updated_count} khách hàng")
    
    # Thống kê
    total_customers = customers.count()
    verified_customers = customers.filter(is_verified=True).count()
    unverified_customers = total_customers - verified_customers
    
    print(f"📊 Thống kê:")
    print(f"   - Tổng khách hàng: {total_customers}")
    print(f"   - Đã xác thực (có CCCD): {verified_customers}")
    print(f"   - Chưa xác thực (chưa có CCCD): {unverified_customers}")

if __name__ == '__main__':
    update_verification_status()