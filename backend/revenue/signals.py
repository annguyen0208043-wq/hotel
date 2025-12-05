from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from rooms.models import Booking
from .models import RevenueReport, CustomerLoyalty, Payment, PaymentMethod
from datetime import date, timedelta
from django.db.models import Sum, Count, Avg
from django.utils import timezone
import logging
import uuid

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Booking)
def update_revenue_on_checkout(sender, instance, created, **kwargs):
    """Cập nhật doanh thu và tạo payment record khi booking checkout"""
    if instance.status == 'checked_out' and instance.paid_amount > 0:
        try:
            # Tạo payment record nếu chưa có
            if not Payment.objects.filter(booking=instance).exists():
                # Lấy payment method mặc định hoặc tạo mới
                payment_method, _ = PaymentMethod.objects.get_or_create(
                    name='Tiền mặt',
                    defaults={'description': 'Thanh toán bằng tiền mặt', 'is_active': True}
                )
                
                # Tạo payment record
                payment_id = f"PAY{timezone.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:6].upper()}"
                Payment.objects.create(
                    payment_id=payment_id,
                    payment_type='booking',
                    booking=instance,
                    payment_method=payment_method,
                    amount=instance.paid_amount,
                    notes=f'Thanh toán cho booking {instance.booking_id} - Checkout tự động'
                )
                logger.info(f"Created payment record {payment_id} for booking {instance.booking_id}")
            
            # Cập nhật doanh thu theo ngày checkout
            checkout_date = instance.actual_check_out.date() if instance.actual_check_out else date.today()
            update_daily_revenue(checkout_date)
            
            # Cập nhật thông tin khách hàng thân thiết
            if instance.customer:
                loyalty, created = CustomerLoyalty.objects.get_or_create(
                    customer=instance.customer
                )
                loyalty.update_loyalty()
                
            logger.info(f"Revenue updated for booking {instance.booking_id} - {instance.paid_amount}")
            
        except Exception as e:
            logger.error(f"Error updating revenue for booking {instance.booking_id}: {str(e)}")


def update_daily_revenue(target_date):
    """Cập nhật doanh thu cho ngày cụ thể"""
    
    # Tính doanh thu phòng cho ngày này (các booking checkout trong ngày)
    # Sử dụng __date lookup để ignore timezone  
    daily_bookings = Booking.objects.filter(
        actual_check_out__date=target_date,
        status='checked_out',
        paid_amount__gt=0
    )
    
    print(f"DEBUG: Tìm thấy {daily_bookings.count()} bookings checkout ngày {target_date}")
    
    room_revenue = daily_bookings.aggregate(
        total=Sum('paid_amount')
    )['total'] or 0
    
    print(f"DEBUG: Room revenue = {room_revenue}")
    
    total_bookings = daily_bookings.count()
    total_guests = daily_bookings.aggregate(
        total=Sum('adults')  # Sử dụng field adults thay vì number_of_guests
    )['total'] or 0
    
    total_nights = sum([
        (booking.check_out_date - booking.check_in_date).days 
        for booking in daily_bookings
    ])
    
    # Tính tỷ lệ lấp đầy phòng
    from rooms.models import Room
    total_rooms = Room.objects.filter(is_active=True).count()
    occupied_rooms = Booking.objects.filter(
        check_in_date__lte=target_date,
        check_out_date__gt=target_date,
        status__in=['checked_in', 'checked_out']
    ).count()
    
    occupancy_rate = (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0
    
    # Tính ADR (Average Daily Rate)
    adr = room_revenue / occupied_rooms if occupied_rooms > 0 else 0
    
    # Tính RevPAR (Revenue Per Available Room) 
    revpar = room_revenue / total_rooms if total_rooms > 0 else 0
    
    # Cập nhật hoặc tạo báo cáo ngày
    report, created = RevenueReport.objects.get_or_create(
        report_date=target_date,
        report_type='daily',
        defaults={
            'room_revenue': room_revenue,
            'service_revenue': 0,  # Service revenue sẽ update riêng
            'total_revenue': room_revenue,
            'total_bookings': total_bookings,
            'total_guests': total_guests,
            'total_nights': total_nights,
            'occupancy_rate': occupancy_rate,
            'average_daily_rate': adr,
            'revenue_per_available_room': revpar,
        }
    )
    
    if not created:
        # Cập nhật báo cáo hiện có
        report.room_revenue = room_revenue
        report.total_revenue = room_revenue + report.service_revenue
        report.total_bookings = total_bookings
        report.total_guests = total_guests
        report.total_nights = total_nights
        report.occupancy_rate = occupancy_rate
        report.average_daily_rate = adr
        report.revenue_per_available_room = revpar
        report.save()
    
    # Cập nhật báo cáo tháng và năm
    update_monthly_revenue(target_date)
    update_yearly_revenue(target_date)


def update_monthly_revenue(target_date):
    """Cập nhật doanh thu tháng"""
    first_day = target_date.replace(day=1)
    
    # Tính tổng doanh thu trong tháng
    monthly_reports = RevenueReport.objects.filter(
        report_date__year=target_date.year,
        report_date__month=target_date.month,
        report_type='daily'
    )
    
    room_revenue = monthly_reports.aggregate(Sum('room_revenue'))['room_revenue__sum'] or 0
    service_revenue = monthly_reports.aggregate(Sum('service_revenue'))['service_revenue__sum'] or 0
    total_bookings = monthly_reports.aggregate(Sum('total_bookings'))['total_bookings__sum'] or 0
    total_guests = monthly_reports.aggregate(Sum('total_guests'))['total_guests__sum'] or 0
    total_nights = monthly_reports.aggregate(Sum('total_nights'))['total_nights__sum'] or 0
    avg_occupancy = monthly_reports.aggregate(Avg('occupancy_rate'))['occupancy_rate__avg'] or 0
    avg_adr = monthly_reports.aggregate(Avg('average_daily_rate'))['average_daily_rate__avg'] or 0
    avg_revpar = monthly_reports.aggregate(Avg('revenue_per_available_room'))['revenue_per_available_room__avg'] or 0
    
    # Cập nhật hoặc tạo báo cáo tháng
    report, created = RevenueReport.objects.get_or_create(
        report_date=first_day,
        report_type='monthly',
        defaults={
            'room_revenue': room_revenue,
            'service_revenue': service_revenue,
            'total_revenue': room_revenue + service_revenue,
            'total_bookings': total_bookings,
            'total_guests': total_guests,
            'total_nights': total_nights,
            'occupancy_rate': avg_occupancy,
            'average_daily_rate': avg_adr,
            'revenue_per_available_room': avg_revpar,
        }
    )
    
    if not created:
        report.room_revenue = room_revenue
        report.service_revenue = service_revenue
        report.total_revenue = room_revenue + service_revenue
        report.total_bookings = total_bookings
        report.total_guests = total_guests
        report.total_nights = total_nights
        report.occupancy_rate = avg_occupancy
        report.average_daily_rate = avg_adr
        report.revenue_per_available_room = avg_revpar
        report.save()


def update_yearly_revenue(target_date):
    """Cập nhật doanh thu năm"""
    first_day = date(target_date.year, 1, 1)
    
    # Tính tổng doanh thu trong năm
    yearly_reports = RevenueReport.objects.filter(
        report_date__year=target_date.year,
        report_type='monthly'
    )
    
    room_revenue = yearly_reports.aggregate(Sum('room_revenue'))['room_revenue__sum'] or 0
    service_revenue = yearly_reports.aggregate(Sum('service_revenue'))['service_revenue__sum'] or 0
    total_bookings = yearly_reports.aggregate(Sum('total_bookings'))['total_bookings__sum'] or 0
    total_guests = yearly_reports.aggregate(Sum('total_guests'))['total_guests__sum'] or 0
    total_nights = yearly_reports.aggregate(Sum('total_nights'))['total_nights__sum'] or 0
    avg_occupancy = yearly_reports.aggregate(Avg('occupancy_rate'))['occupancy_rate__avg'] or 0
    avg_adr = yearly_reports.aggregate(Avg('average_daily_rate'))['average_daily_rate__avg'] or 0
    avg_revpar = yearly_reports.aggregate(Avg('revenue_per_available_room'))['revenue_per_available_room__avg'] or 0
    
    # Cập nhật hoặc tạo báo cáo năm
    report, created = RevenueReport.objects.get_or_create(
        report_date=first_day,
        report_type='yearly',
        defaults={
            'room_revenue': room_revenue,
            'service_revenue': service_revenue,
            'total_revenue': room_revenue + service_revenue,
            'total_bookings': total_bookings,
            'total_guests': total_guests,
            'total_nights': total_nights,
            'occupancy_rate': avg_occupancy,
            'average_daily_rate': avg_adr,
            'revenue_per_available_room': avg_revpar,
        }
    )
    
    if not created:
        report.room_revenue = room_revenue
        report.service_revenue = service_revenue
        report.total_revenue = room_revenue + service_revenue
        report.total_bookings = total_bookings
        report.total_guests = total_guests
        report.total_nights = total_nights
        report.occupancy_rate = avg_occupancy
        report.average_daily_rate = avg_adr
        report.revenue_per_available_room = avg_revpar
        report.save()