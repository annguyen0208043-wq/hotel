from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from rooms.models import Booking, Room, RoomType
from accounts.models import Account

class StatisticsViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Chỉ admin và employee có quyền xem thống kê
        user_type = getattr(self.request.user, 'user_type', None)
        if user_type in ['admin', 'employee']:
            return Booking.objects.all()
        return Booking.objects.none()
    
    @action(detail=False, methods=['get'])
    def revenue(self, request):
        """Thống kê doanh thu"""
        try:
            # Lấy tham số thời gian
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            period = request.query_params.get('period', 'month')  # day, week, month, year
            
            # Mặc định là tháng hiện tại
            if not start_date or not end_date:
                today = timezone.now().date()
                if period == 'day':
                    start_date = today
                    end_date = today
                elif period == 'week':
                    start_date = today - timedelta(days=today.weekday())
                    end_date = start_date + timedelta(days=6)
                elif period == 'month':
                    start_date = today.replace(day=1)
                    next_month = start_date.replace(month=start_date.month + 1) if start_date.month < 12 else start_date.replace(year=start_date.year + 1, month=1)
                    end_date = next_month - timedelta(days=1)
                else:  # year
                    start_date = today.replace(month=1, day=1)
                    end_date = today.replace(month=12, day=31)
            else:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            # Thống kê doanh thu
            bookings = Booking.objects.filter(
                check_in_date__range=[start_date, end_date],
                status__in=['checked_in', 'checked_out']
            )
            
            total_revenue = bookings.aggregate(total=Sum('total_amount'))['total'] or 0
            total_bookings = bookings.count()
            
            # Doanh thu theo ngày (cho biểu đồ)
            daily_revenue = []
            current_date = start_date
            while current_date <= end_date:
                day_revenue = bookings.filter(
                    check_in_date=current_date
                ).aggregate(total=Sum('total_amount'))['total'] or 0
                
                daily_revenue.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'revenue': float(day_revenue)
                })
                current_date += timedelta(days=1)
            
            # Top room types
            room_type_stats = bookings.values('room__room_type__name').annotate(
                count=Count('id'),
                revenue=Sum('total_amount')
            ).order_by('-revenue')[:5]
            
            # Tỷ lệ lấp đầy
            total_rooms = Room.objects.filter(is_active=True).count()
            occupied_rooms = Room.objects.filter(status='occupied').count()
            occupancy_rate = (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0
            
            # Thống kê theo khoảng thời gian khác
            today = timezone.now().date()
            
            # Doanh thu hôm nay
            today_revenue = Booking.objects.filter(
                check_in_date=today,
                status__in=['checked_in', 'checked_out']
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            # Doanh thu tuần này
            week_start = today - timedelta(days=today.weekday())
            week_revenue = Booking.objects.filter(
                check_in_date__range=[week_start, today],
                status__in=['checked_in', 'checked_out']
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            # Doanh thu tháng này
            month_start = today.replace(day=1)
            month_revenue = Booking.objects.filter(
                check_in_date__range=[month_start, today],
                status__in=['checked_in', 'checked_out']
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            return Response({
                'period': period,
                'start_date': start_date,
                'end_date': end_date,
                'total_revenue': float(total_revenue),
                'total_bookings': total_bookings,
                'daily_revenue': daily_revenue,
                'top_room_types': [
                    {
                        'name': item['room__room_type__name'],
                        'count': item['count'],
                        'revenue': float(item['revenue'] or 0)
                    }
                    for item in room_type_stats
                ],
                'occupancy_rate': round(occupancy_rate, 1),
                'today_revenue': float(today_revenue),
                'week_revenue': float(week_revenue),
                'month_revenue': float(month_revenue)
            })
            
        except Exception as e:
            return Response(
                {'error': f'Lỗi khi lấy thống kê: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Thống kê cho dashboard"""
        try:
            today = timezone.now().date()
            
            # Check-in hôm nay
            today_checkins = Booking.objects.filter(
                check_in_date=today,
                status='confirmed'
            ).count()
            
            # Check-out hôm nay
            today_checkouts = Booking.objects.filter(
                check_out_date=today,
                status='checked_in'
            ).count()
            
            # Phòng trống
            available_rooms = Room.objects.filter(
                status='available',
                is_active=True
            ).count()
            
            # Nhiệm vụ còn lại (pending bookings)
            pending_tasks = Booking.objects.filter(status='pending').count()
            
            # Tổng số phòng
            total_rooms = Room.objects.filter(is_active=True).count()
            
            # Phòng đã đặt
            booked_rooms = Room.objects.filter(status='occupied').count()
            
            # Tổng khách hàng
            total_customers = Account.objects.filter(user_type='customer').count()
            
            # Doanh thu tháng này
            month_start = today.replace(day=1)
            month_revenue = Booking.objects.filter(
                check_in_date__range=[month_start, today],
                status__in=['checked_in', 'checked_out']
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            return Response({
                'today_checkins': today_checkins,
                'today_checkouts': today_checkouts,
                'available_rooms': available_rooms,
                'pending_tasks': pending_tasks,
                'total_rooms': total_rooms,
                'booked_rooms': booked_rooms,
                'total_customers': total_customers,
                'month_revenue': float(month_revenue)
            })
            
        except Exception as e:
            return Response(
                {'error': f'Lỗi khi lấy thống kê dashboard: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )