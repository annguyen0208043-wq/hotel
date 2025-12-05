from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import datetime, timedelta, date
import uuid
from .models import RevenueReport, Payment, PaymentMethod
from .serializers import (
    RevenueReportSerializer, PaymentSerializer, 
    PaymentCreateSerializer, PaymentMethodSerializer
)
from rooms.models import Booking, Room
from services.models import ServiceOrder

class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.filter(is_active=True)
    serializer_class = PaymentMethodSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def perform_create(self, serializer):
        # Tạo payment_id tự động
        payment_id = f"PAY{timezone.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:6].upper()}"
        serializer.save(payment_id=payment_id)
    
    @action(detail=False, methods=['get'])
    def today_payments(self, request):
        today = timezone.now().date()
        payments = self.queryset.filter(created_at__date=today)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_method(self, request):
        method_id = request.query_params.get('method_id')
        if method_id:
            payments = self.queryset.filter(payment_method_id=method_id)
            serializer = self.get_serializer(payments, many=True)
            return Response(serializer.data)
        return Response({'error': 'method_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)

class RevenueReportViewSet(viewsets.ModelViewSet):
    queryset = RevenueReport.objects.all().order_by('-report_date')
    serializer_class = RevenueReportSerializer
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        today = timezone.now().date()
        
        # Doanh thu hôm nay
        today_bookings = Booking.objects.filter(
            created_at__date=today,
            status__in=['confirmed', 'checked_in', 'checked_out']
        ).aggregate(total=Sum('paid_amount'))['total'] or 0
        
        today_services = ServiceOrder.objects.filter(
            created_at__date=today,
            status='completed'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        today_revenue = today_bookings + today_services
        
        # Doanh thu tháng này
        month_start = today.replace(day=1)
        month_bookings = Booking.objects.filter(
            created_at__date__gte=month_start,
            status__in=['confirmed', 'checked_in', 'checked_out']
        ).aggregate(total=Sum('paid_amount'))['total'] or 0
        
        month_services = ServiceOrder.objects.filter(
            created_at__date__gte=month_start,
            status='completed'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        month_revenue = month_bookings + month_services
        
        # Tỷ lệ lấp đầy phòng hôm nay
        total_rooms = Room.objects.filter(is_active=True).count()
        occupied_rooms = Room.objects.filter(
            status__in=['occupied', 'reserved']
        ).count()
        occupancy_rate = (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0
        
        # Top 5 dịch vụ bán chạy tháng này
        top_services = ServiceOrder.objects.filter(
            created_at__date__gte=month_start,
            status='completed'
        ).values('service__name').annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('total_amount')
        ).order_by('-total_revenue')[:5]
        
        return Response({
            'today_revenue': today_revenue,
            'month_revenue': month_revenue,
            'occupancy_rate': round(occupancy_rate, 2),
            'total_rooms': total_rooms,
            'occupied_rooms': occupied_rooms,
            'top_services': list(top_services)
        })
    
    @action(detail=False, methods=['get'])
    def monthly_chart(self, request):
        # Doanh thu 12 tháng gần nhất
        today = timezone.now().date()
        data = []
        
        for i in range(12):
            if i == 0:
                month_date = today.replace(day=1)
            else:
                if today.month - i <= 0:
                    month_date = today.replace(
                        year=today.year - 1,
                        month=12 + (today.month - i),
                        day=1
                    )
                else:
                    month_date = today.replace(
                        month=today.month - i,
                        day=1
                    )
            
            # Tính ngày cuối tháng
            if month_date.month == 12:
                next_month = month_date.replace(
                    year=month_date.year + 1,
                    month=1,
                    day=1
                )
            else:
                next_month = month_date.replace(
                    month=month_date.month + 1,
                    day=1
                )
            
            # Doanh thu đặt phòng
            month_bookings = Booking.objects.filter(
                created_at__date__gte=month_date,
                created_at__date__lt=next_month,
                status__in=['confirmed', 'checked_in', 'checked_out']
            ).aggregate(total=Sum('paid_amount'))['total'] or 0
            
            # Doanh thu dịch vụ
            month_services = ServiceOrder.objects.filter(
                created_at__date__gte=month_date,
                created_at__date__lt=next_month,
                status='completed'
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            data.insert(0, {
                'month': month_date.strftime('%Y-%m'),
                'room_revenue': float(month_bookings),
                'service_revenue': float(month_services),
                'total_revenue': float(month_bookings + month_services)
            })
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def daily_chart(self, request):
        # Doanh thu 30 ngày gần nhất
        today = timezone.now().date()
        data = []
        
        for i in range(30):
            date_check = today - timedelta(days=i)
            
            # Doanh thu đặt phòng
            day_bookings = Booking.objects.filter(
                created_at__date=date_check,
                status__in=['confirmed', 'checked_in', 'checked_out']
            ).aggregate(total=Sum('paid_amount'))['total'] or 0
            
            # Doanh thu dịch vụ
            day_services = ServiceOrder.objects.filter(
                created_at__date=date_check,
                status='completed'
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            data.insert(0, {
                'date': date_check.strftime('%Y-%m-%d'),
                'room_revenue': float(day_bookings),
                'service_revenue': float(day_services),
                'total_revenue': float(day_bookings + day_services)
            })
        
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def generate_report(self, request):
        report_date = request.data.get('report_date')
        report_type = request.data.get('report_type', 'daily')
        
        if not report_date:
            return Response({'error': 'report_date required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        report_date = datetime.strptime(report_date, '%Y-%m-%d').date()
        
        # Tính toán doanh thu theo loại báo cáo
        if report_type == 'daily':
            start_date = end_date = report_date
        elif report_type == 'weekly':
            start_date = report_date - timedelta(days=report_date.weekday())
            end_date = start_date + timedelta(days=6)
        elif report_type == 'monthly':
            start_date = report_date.replace(day=1)
            if report_date.month == 12:
                end_date = report_date.replace(year=report_date.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                end_date = report_date.replace(month=report_date.month + 1, day=1) - timedelta(days=1)
        elif report_type == 'yearly':
            start_date = report_date.replace(month=1, day=1)
            end_date = report_date.replace(month=12, day=31)
        
        # Tính doanh thu phòng
        room_revenue = Booking.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            status__in=['confirmed', 'checked_in', 'checked_out']
        ).aggregate(total=Sum('paid_amount'))['total'] or 0
        
        # Tính doanh thu dịch vụ
        service_revenue = ServiceOrder.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            status='completed'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Đếm số booking và service orders
        total_bookings = Booking.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            status__in=['confirmed', 'checked_in', 'checked_out']
        ).count()
        
        total_service_orders = ServiceOrder.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            status='completed'
        ).count()
        
        # Tính tỷ lệ lấp đầy phòng (trung bình trong khoảng thời gian)
        total_rooms = Room.objects.filter(is_active=True).count()
        if total_rooms > 0:
            occupied_days = Booking.objects.filter(
                check_in_date__lte=end_date,
                check_out_date__gte=start_date,
                status__in=['confirmed', 'checked_in', 'checked_out']
            ).count()
            days_in_period = (end_date - start_date).days + 1
            occupancy_rate = (occupied_days / (total_rooms * days_in_period)) * 100
        else:
            occupancy_rate = 0
        
        # Tạo hoặc cập nhật báo cáo
        report, created = RevenueReport.objects.update_or_create(
            report_date=report_date,
            report_type=report_type,
            defaults={
                'room_revenue': room_revenue,
                'service_revenue': service_revenue,
                'total_revenue': room_revenue + service_revenue,
                'total_bookings': total_bookings,
                'total_service_orders': total_service_orders,
                'occupancy_rate': round(occupancy_rate, 2)
            }
        )
        
        serializer = self.get_serializer(report)
        return Response(serializer.data)