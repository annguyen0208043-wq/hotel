from rest_framework import serializers
from .models import Room, RoomType, Booking
from customers.serializers import CustomerSerializer
from employees.serializers import EmployeeSerializer

class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    room_type_detail = RoomTypeSerializer(source='room_type', read_only=True)
    
    class Meta:
        model = Room
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    customer_detail = CustomerSerializer(source='customer', read_only=True)
    room_detail = RoomSerializer(source='room', read_only=True)
    created_by_detail = EmployeeSerializer(source='created_by', read_only=True)
    nights = serializers.ReadOnlyField()
    is_paid = serializers.ReadOnlyField()
    
    class Meta:
        model = Booking
        fields = '__all__'
    
    def validate(self, data):
        if data['check_in_date'] >= data['check_out_date']:
            raise serializers.ValidationError("Ngày check-out phải sau ngày check-in")
        
        # Kiểm tra room availability (nếu không phải update)
        if not self.instance:
            room = data['room']
            check_in = data['check_in_date']
            check_out = data['check_out_date']
            
            overlapping_bookings = Booking.objects.filter(
                room=room,
                status__in=['confirmed', 'checked_in'],
                check_in_date__lt=check_out,
                check_out_date__gt=check_in
            )
            
            if overlapping_bookings.exists():
                raise serializers.ValidationError("Phòng này đã được đặt trong khoảng thời gian này")
        
        return data

class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        exclude = ['booking_id', 'created_by', 'created_at', 'updated_at']