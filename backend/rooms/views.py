from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import datetime
import uuid
from .models import Room, RoomType, Booking
from .serializers import (
    RoomSerializer, RoomTypeSerializer, 
    BookingSerializer, BookingCreateSerializer
)

class RoomTypeViewSet(viewsets.ModelViewSet):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        check_in = request.query_params.get('check_in')
        check_out = request.query_params.get('check_out')
        
        if check_in and check_out:
            check_in_date = datetime.strptime(check_in, '%Y-%m-%d').date()
            check_out_date = datetime.strptime(check_out, '%Y-%m-%d').date()
            
            # Lấy các phòng không có booking trùng lặp
            booked_rooms = Booking.objects.filter(
                status__in=['confirmed', 'checked_in'],
                check_in_date__lt=check_out_date,
                check_out_date__gt=check_in_date
            ).values_list('room_id', flat=True)
            
            available_rooms = self.queryset.filter(
                status='available',
                is_active=True
            ).exclude(id__in=booked_rooms)
            
            serializer = self.get_serializer(available_rooms, many=True)
            return Response(serializer.data)
        
        return Response({'error': 'check_in and check_out parameters required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        room_status = request.query_params.get('status')
        if room_status:
            rooms = self.queryset.filter(status=room_status, is_active=True)
            serializer = self.get_serializer(rooms, many=True)
            return Response(serializer.data)
        return Response({'error': 'status parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        room = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Room.STATUS_CHOICES):
            room.status = new_status
            if new_status == 'cleaning':
                room.last_cleaned = timezone.now()
            room.save()
            return Response({'status': 'Room status updated'})
        return Response({'error': 'Invalid status'}, 
                       status=status.HTTP_400_BAD_REQUEST)

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer
    
    def perform_create(self, serializer):
        # Tạo booking_id tự động
        booking_id = f"BK{timezone.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:6].upper()}"
        serializer.save(
            booking_id=booking_id,
            created_by=self.request.user if hasattr(self.request.user, 'employee_id') else None
        )
    
    @action(detail=False, methods=['get'])
    def today_checkins(self, request):
        today = timezone.now().date()
        checkins = self.queryset.filter(
            check_in_date=today,
            status='confirmed'
        )
        serializer = self.get_serializer(checkins, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today_checkouts(self, request):
        today = timezone.now().date()
        checkouts = self.queryset.filter(
            check_out_date=today,
            status='checked_in'
        )
        serializer = self.get_serializer(checkouts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def check_in(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'confirmed':
            booking.status = 'checked_in'
            booking.actual_check_in = timezone.now()
            booking.room.status = 'occupied'
            booking.room.save()
            booking.save()
            return Response({'status': 'Checked in successfully'})
        return Response({'error': 'Invalid booking status for check-in'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def check_out(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'checked_in':
            booking.status = 'checked_out'
            booking.actual_check_out = timezone.now()
            booking.room.status = 'cleaning'
            booking.room.save()
            booking.save()
            return Response({'status': 'Checked out successfully'})
        return Response({'error': 'Invalid booking status for check-out'}, 
                       status=status.HTTP_400_BAD_REQUEST)