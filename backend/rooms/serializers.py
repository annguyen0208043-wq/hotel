from rest_framework import serializers
from .models import Room, RoomType, Booking
from accounts.serializers import AccountSerializer

class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    # For reading: return full room type details
    room_type = RoomTypeSerializer(read_only=True)
    effective_price = serializers.ReadOnlyField(source='get_effective_price')
    
    # For writing: accept room type ID
    room_type_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Room
        fields = '__all__'
    
    def create(self, validated_data):
        # Extract room_type_id and get the RoomType instance
        room_type_id = validated_data.pop('room_type_id', None)
        if room_type_id:
            try:
                room_type = RoomType.objects.get(id=room_type_id)
                validated_data['room_type'] = room_type
            except RoomType.DoesNotExist:
                raise serializers.ValidationError({'room_type_id': 'Room type not found'})
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Extract room_type_id and get the RoomType instance
        room_type_id = validated_data.pop('room_type_id', None)
        if room_type_id:
            try:
                room_type = RoomType.objects.get(id=room_type_id)
                validated_data['room_type'] = room_type
            except RoomType.DoesNotExist:
                raise serializers.ValidationError({'room_type_id': 'Room type not found'})
        
        return super().update(instance, validated_data)

class BookingSerializer(serializers.ModelSerializer):
    customer_detail = AccountSerializer(source='customer', read_only=True)
    room_detail = RoomSerializer(source='room', read_only=True)
    created_by_detail = AccountSerializer(source='created_by', read_only=True)
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