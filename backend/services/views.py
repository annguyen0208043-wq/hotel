from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Count
from datetime import datetime, date, timedelta

from .models import Service, ServiceCategory, RoomServiceOrder, RoomServiceItem
from .serializers import (
    ServiceSerializer, ServiceCategorySerializer, 
    RoomServiceOrderSerializer, CreateRoomServiceOrderSerializer
)
from rooms.models import Room


class ServiceCategoryListView(generics.ListCreateAPIView):
    """Lấy danh sách categories và tạo category mới"""
    queryset = ServiceCategory.objects.filter(is_active=True).order_by('sort_order')
    serializer_class = ServiceCategorySerializer
    permission_classes = [IsAuthenticated]


class ServiceListView(generics.ListCreateAPIView):
    """Lấy danh sách services và tạo service mới"""
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Service.objects.filter(is_available=True)
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset.order_by('name')


class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Chi tiết, cập nhật và xóa service"""
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]


class ServiceCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Chi tiết, cập nhật và xóa category"""
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [IsAuthenticated]


class RoomServiceOrderListView(generics.ListAPIView):
    """Lấy danh sách orders theo phòng hoặc tất cả"""
    serializer_class = RoomServiceOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = RoomServiceOrder.objects.all().prefetch_related('items__service', 'room')
        
        # Filter by room
        room_id = self.request.query_params.get('room')
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by payment status
        payment_status = self.request.query_params.get('payment_status')
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        
        # Filter by date
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(ordered_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(ordered_at__date__lte=date_to)
        
        return queryset.order_by('-ordered_at')


class RoomServiceOrderCreateView(generics.CreateAPIView):
    """Tạo order mới"""
    queryset = RoomServiceOrder.objects.all()
    serializer_class = CreateRoomServiceOrderSerializer
    permission_classes = [IsAuthenticated]


class RoomServiceOrderDetailView(generics.RetrieveUpdateAPIView):
    """Chi tiết và cập nhật order"""
    queryset = RoomServiceOrder.objects.all()
    serializer_class = RoomServiceOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        action = request.data.get('action')
        
        if action == 'confirm':
            order.status = 'confirmed'
            order.save()
            return Response({'message': 'Order đã được xác nhận'})
        
        elif action == 'preparing':
            order.status = 'preparing'
            order.save()
            return Response({'message': 'Order đang chuẩn bị'})
        
        elif action == 'completed':
            order.status = 'completed'
            order.completed_at = datetime.now()
            order.save()
            return Response({'message': 'Order đã hoàn thành'})
        
        elif action == 'cancelled':
            order.status = 'cancelled'
            order.save()
            return Response({'message': 'Order đã hủy'})
        
        elif action == 'mark_paid':
            order.payment_status = 'paid'
            order.save()
            return Response({'message': 'Đã thanh toán'})
        
        return super().patch(request, *args, **kwargs)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def room_service_dashboard(request):
    """Dashboard cho service management - giống như bàn trong nhà hàng"""
    
    # Lấy tất cả phòng có khách
    occupied_rooms = Room.objects.filter(
        status__in=['occupied', 'maintenance']
    ).select_related('room_type').prefetch_related(
        'bookings', 'service_orders'
    )
    
    room_data = []
    
    for room in occupied_rooms:
        # Thông tin booking hiện tại
        current_booking = room.bookings.filter(
            check_in_date__lte=date.today(),
            check_out_date__gte=date.today()
        ).first()
        
        # Orders hôm nay
        today_orders = room.service_orders.filter(
            ordered_at__date=date.today()
        ).prefetch_related('items')
        
        # Tổng tiền hôm nay
        total_today = sum(
            sum(item.quantity * item.unit_price for item in order.items.all())
            for order in today_orders
        )
        
        # Orders đang pending
        pending_orders = today_orders.filter(status__in=['pending', 'confirmed', 'preparing'])
        
        room_info = {
            'room_id': room.id,
            'room_number': room.room_number,
            'room_type': room.room_type.name,
            'status': room.status,
            'customer_name': current_booking.customer.full_name if current_booking and current_booking.customer else None,
            'check_in': current_booking.check_in_date.isoformat() if current_booking else None,
            'check_out': current_booking.check_out_date.isoformat() if current_booking else None,
            'orders_count': today_orders.count(),
            'pending_orders': pending_orders.count(),
            'total_today': float(total_today),
            'has_unpaid_orders': today_orders.filter(payment_status='unpaid').exists()
        }
        
        room_data.append(room_info)
    
    # Thống kê tổng quan
    today = date.today()
    stats = {
        'total_orders_today': RoomServiceOrder.objects.filter(ordered_at__date=today).count(),
        'pending_orders': RoomServiceOrder.objects.filter(
            status__in=['pending', 'confirmed', 'preparing'],
            ordered_at__date=today
        ).count(),
        'completed_orders': RoomServiceOrder.objects.filter(
            status='completed',
            ordered_at__date=today
        ).count(),
        'total_revenue_today': 0  # Tính sau
    }
    
    return Response({
        'rooms': room_data,
        'stats': stats
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def service_statistics(request):
    """Thống kê dịch vụ"""
    
    # Ngày bắt đầu và kết thúc
    date_from = request.GET.get('date_from', date.today().isoformat())
    date_to = request.GET.get('date_to', date.today().isoformat())
    
    orders = RoomServiceOrder.objects.filter(
        ordered_at__date__range=[date_from, date_to]
    )
    
    # Top services
    top_services = RoomServiceItem.objects.filter(
        order__ordered_at__date__range=[date_from, date_to]
    ).values(
        'service__name', 'service__category__name'
    ).annotate(
        total_quantity=Sum('quantity'),
        total_revenue=Sum('quantity') * Sum('unit_price')
    ).order_by('-total_quantity')[:10]
    
    return Response({
        'date_from': date_from,
        'date_to': date_to,
        'total_orders': orders.count(),
        'completed_orders': orders.filter(status='completed').count(),
        'total_revenue': sum(
            sum(item.quantity * item.unit_price for item in order.items.all())
            for order in orders.filter(payment_status='paid')
        ),
        'top_services': list(top_services)
    })