from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Sum, Count, Avg
from django.utils import timezone
from datetime import datetime, date, timedelta
from .models import RevenueReport, Payment, PaymentMethod, CustomerLoyalty
from .serializers import (
    RevenueReportSerializer, 
    PaymentSerializer, 
    PaymentMethodSerializer,
    CustomerLoyaltySerializer
)
from rooms.models import Booking, Room
from customers.models import Customer


class RevenueReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RevenueReport.objects.all()
    serializer_class = RevenueReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = RevenueReport.objects.all()
        report_type = self.request.query_params.get('type', 'daily')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        queryset = queryset.filter(report_type=report_type)
        
        if date_from:
            queryset = queryset.filter(report_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(report_date__lte=date_to)
            
        return queryset.order_by('-report_date')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_dashboard(request):
    """Dashboard tổng quan doanh thu"""
    today = date.today()
    yesterday = today - timedelta(days=1)
    this_month = today.replace(day=1)
    last_month = (this_month - timedelta(days=1)).replace(day=1)
    this_year = today.replace(month=1, day=1)
    
    # Doanh thu hôm nay
    today_report = RevenueReport.objects.filter(
        report_date=today, report_type='daily'
    ).first()
    
    # Doanh thu hôm qua
    yesterday_report = RevenueReport.objects.filter(
        report_date=yesterday, report_type='daily'
    ).first()
    
    # Doanh thu tháng này
    this_month_report = RevenueReport.objects.filter(
        report_date=this_month, report_type='monthly'
    ).first()
    
    # Doanh thu tháng trước
    last_month_report = RevenueReport.objects.filter(
        report_date=last_month, report_type='monthly'
    ).first()
    
    # Doanh thu năm nay
    this_year_report = RevenueReport.objects.filter(
        report_date=this_year, report_type='yearly'
    ).first()
    
    # Top khách hàng thân thiết
    top_customers = CustomerLoyalty.objects.select_related('customer').order_by('-total_spent')[:10]
    
    # Thống kê phòng
    total_rooms = Room.objects.filter(is_active=True).count()
    occupied_rooms = Booking.objects.filter(
        check_in_date__lte=today,
        check_out_date__gt=today,
        status='checked_in'
    ).count()
    
    return Response({
        'today': {
            'revenue': today_report.total_revenue if today_report else 0,
            'bookings': today_report.total_bookings if today_report else 0,
            'guests': today_report.total_guests if today_report else 0,
            'occupancy_rate': today_report.occupancy_rate if today_report else 0,
        },
        'yesterday': {
            'revenue': yesterday_report.total_revenue if yesterday_report else 0,
            'bookings': yesterday_report.total_bookings if yesterday_report else 0,
            'guests': yesterday_report.total_guests if yesterday_report else 0,
            'occupancy_rate': yesterday_report.occupancy_rate if yesterday_report else 0,
        },
        'this_month': {
            'revenue': this_month_report.total_revenue if this_month_report else 0,
            'bookings': this_month_report.total_bookings if this_month_report else 0,
            'guests': this_month_report.total_guests if this_month_report else 0,
            'occupancy_rate': this_month_report.occupancy_rate if this_month_report else 0,
        },
        'last_month': {
            'revenue': last_month_report.total_revenue if last_month_report else 0,
            'bookings': last_month_report.total_bookings if last_month_report else 0,
            'guests': last_month_report.total_guests if last_month_report else 0,
            'occupancy_rate': last_month_report.occupancy_rate if last_month_report else 0,
        },
        'this_year': {
            'revenue': this_year_report.total_revenue if this_year_report else 0,
            'bookings': this_year_report.total_bookings if this_year_report else 0,
            'guests': this_year_report.total_guests if this_year_report else 0,
            'occupancy_rate': this_year_report.occupancy_rate if this_year_report else 0,
        },
        'room_stats': {
            'total_rooms': total_rooms,
            'occupied_rooms': occupied_rooms,
            'available_rooms': total_rooms - occupied_rooms,
            'occupancy_rate': (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0,
        },
        'top_customers': CustomerLoyaltySerializer(top_customers, many=True).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_chart(request):
    """Dữ liệu cho biểu đồ doanh thu"""
    chart_type = request.GET.get('type', 'daily')  # daily, monthly, yearly
    period = int(request.GET.get('period', 30))  # số ngày/tháng/năm
    
    today = date.today()
    
    if chart_type == 'daily':
        # Doanh thu 30 ngày gần nhất
        start_date = today - timedelta(days=period-1)
        reports = RevenueReport.objects.filter(
            report_type='daily',
            report_date__gte=start_date,
            report_date__lte=today
        ).order_by('report_date')
        
    elif chart_type == 'monthly':
        # Doanh thu 12 tháng gần nhất
        start_date = today.replace(day=1)
        for i in range(period-1):
            if start_date.month == 1:
                start_date = start_date.replace(year=start_date.year-1, month=12)
            else:
                start_date = start_date.replace(month=start_date.month-1)
        
        reports = RevenueReport.objects.filter(
            report_type='monthly',
            report_date__gte=start_date
        ).order_by('report_date')
        
    else:  # yearly
        # Doanh thu 5 năm gần nhất
        start_year = today.year - period + 1
        start_date = date(start_year, 1, 1)
        reports = RevenueReport.objects.filter(
            report_type='yearly',
            report_date__gte=start_date
        ).order_by('report_date')
    
    chart_data = []
    for report in reports:
        chart_data.append({
            'date': report.report_date.strftime('%Y-%m-%d'),
            'room_revenue': float(report.room_revenue),
            'service_revenue': float(report.service_revenue),
            'total_revenue': float(report.total_revenue),
            'bookings': report.total_bookings,
            'guests': report.total_guests,
            'occupancy_rate': float(report.occupancy_rate),
        })
    
    return Response({
        'chart_type': chart_type,
        'period': period,
        'data': chart_data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_analytics(request):
    """Phân tích khách hàng"""
    
    # Khách hàng thân thiết theo tier
    loyalty_stats = CustomerLoyalty.objects.values('tier').annotate(
        count=Count('id'),
        total_spent=Sum('total_spent'),
        avg_spent=Avg('total_spent')
    )
    
    # Khách hàng mới trong tháng
    this_month = date.today().replace(day=1)
    new_customers = Customer.objects.filter(
        created_at__gte=this_month
    ).count()
    
    # Khách hàng quay lại (có > 1 booking)
    returning_customers = CustomerLoyalty.objects.filter(
        total_bookings__gt=1
    ).count()
    
    # Top 10 khách hàng chi tiêu nhiều nhất
    top_spenders = CustomerLoyalty.objects.select_related('customer').order_by('-total_spent')[:10]
    
    return Response({
        'loyalty_stats': list(loyalty_stats),
        'new_customers_this_month': new_customers,
        'returning_customers': returning_customers,
        'total_customers': Customer.objects.count(),
        'top_spenders': CustomerLoyaltySerializer(top_spenders, many=True).data
    })


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]


class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.filter(is_active=True)
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]