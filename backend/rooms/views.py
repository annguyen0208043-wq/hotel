from rest_framework import viewsets, status, permissions
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
    permission_classes = [permissions.IsAuthenticated]
    
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
    permission_classes = [permissions.AllowAny]  # Temporary for testing
    
    def get_queryset(self):
        # Temporary: return all bookings for testing
        return Booking.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer
    
    def create(self, request, *args, **kwargs):
        """Override create để debug lỗi"""
        print(f"DEBUG: Booking creation request data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print(f"DEBUG: Serializer validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            print(f"DEBUG: Error during perform_create: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def perform_update(self, serializer):
        """Tự động cập nhật trạng thái phòng khi thay đổi trạng thái booking"""
        old_status = self.get_object().status
        new_booking = serializer.save()
        new_status = new_booking.status
        
        # Cập nhật trạng thái phòng dựa trên trạng thái booking
        if old_status != new_status:
            room = new_booking.room
            
            if new_status == 'checked_in':
                room.status = 'occupied'  # Phòng đang có khách
                # Cập nhật thời gian check-in thực tế nếu chưa có
                if not new_booking.actual_check_in:
                    new_booking.actual_check_in = timezone.now()
                    new_booking.save()
                    
            elif new_status == 'checked_out':
                room.status = 'cleaning'  # Phòng cần dọn dẹp
                # Cập nhật thời gian check-out thực tế nếu chưa có
                if not new_booking.actual_check_out:
                    new_booking.actual_check_out = timezone.now()
                    new_booking.save()
                    
            elif new_status == 'cancelled':
                # Khi hủy booking, kiểm tra xem có booking khác cho phòng này không
                other_bookings = Booking.objects.filter(
                    room=room,
                    status__in=['pending', 'confirmed', 'checked_in']
                ).exclude(id=new_booking.id)
                
                if not other_bookings.exists():
                    room.status = 'available'  # Không có booking khác, phòng trống
                # Nếu có booking khác thì giữ nguyên trạng thái reserved
                    
            elif new_status in ['pending', 'confirmed']:
                # Khi có booking (pending hoặc confirmed), phòng được đặt
                room.status = 'reserved'
                
            room.save()
            
    def perform_create(self, serializer):
        # Tạo booking_id tự động
        booking_id = f"BK{timezone.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:6].upper()}"
        
        # Tự động set created_by nếu user là admin hoặc employee
        user = self.request.user
        created_by = None
        if hasattr(user, 'user_type') and user.user_type in ['admin', 'employee']:
            created_by = user
        
        # Lưu booking
        new_booking = serializer.save(
            booking_id=booking_id,
            created_by=created_by
        )
        
        # Cập nhật trạng thái phòng ngay khi có booking (bất kể status nào)
        room = new_booking.room
        if new_booking.status in ['pending', 'confirmed']:
            room.status = 'reserved'  # Phòng đã được đặt ngay khi có booking
        elif new_booking.status == 'checked_in':
            room.status = 'occupied'  # Phòng đang có khách
            if not new_booking.actual_check_in:
                new_booking.actual_check_in = timezone.now()
                new_booking.save()
        
        room.save()
    
    def perform_destroy(self, instance):
        """Cập nhật trạng thái phòng khi xóa booking"""
        room = instance.room
        
        # Kiểm tra xem có booking khác cho phòng này không (trừ booking đang xóa)
        other_bookings = Booking.objects.filter(
            room=room,
            status__in=['pending', 'confirmed', 'checked_in']
        ).exclude(id=instance.id)
        
        # Xóa booking trước
        instance.delete()
        
        # Cập nhật trạng thái phòng dựa trên các booking còn lại
        if other_bookings.exists():
            # Còn có booking khác, kiểm tra trạng thái cao nhất
            if other_bookings.filter(status='checked_in').exists():
                room.status = 'occupied'
            else:
                room.status = 'reserved'
        else:
            # Không còn booking nào, phòng trống
            room.status = 'available'
            
        room.save()
    
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
    
    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """Get current user's bookings"""
        print(f"DEBUG: my_bookings called by user: {request.user}")
        
        if not request.user.is_authenticated:
            print("DEBUG: User not authenticated")
            return Response({'error': 'Authentication required'}, 
                           status=status.HTTP_401_UNAUTHORIZED)
        
        bookings = Booking.objects.filter(customer=request.user).order_by('-created_at')
        print(f"DEBUG: Found {bookings.count()} bookings for user {request.user}")
        
        serializer = self.get_serializer(bookings, many=True)
        response_data = serializer.data
        
        print(f"DEBUG: Serialized data type: {type(response_data)}")
        print(f"DEBUG: Serialized data length: {len(response_data) if isinstance(response_data, list) else 'Not a list'}")
        
        return Response(response_data)