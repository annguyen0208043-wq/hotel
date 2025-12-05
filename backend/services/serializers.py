from rest_framework import serializers
from .models import Service, ServiceCategory, RoomServiceOrder, RoomServiceItem
from rooms.models import Room
from accounts.models import Account


class ServiceCategorySerializer(serializers.ModelSerializer):
    services_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description', 'icon', 'is_active', 'sort_order', 'services_count']
    
    def get_services_count(self, obj):
        return obj.services.filter(is_available=True).count()


class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'name', 'description', 'category', 'category_name', 'price', 'unit', 
                 'preparation_time', 'is_available']


class RoomServiceItemSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_unit = serializers.CharField(source='service.unit', read_only=True)
    service_price = serializers.DecimalField(source='service.price', max_digits=10, decimal_places=2, read_only=True)
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = RoomServiceItem
        fields = ['id', 'service', 'service_name', 'service_unit', 'service_price',
                 'quantity', 'unit_price', 'notes', 'total_amount']
    
    def get_total_amount(self, obj):
        return obj.quantity * obj.unit_price


class RoomServiceOrderSerializer(serializers.ModelSerializer):
    items = RoomServiceItemSerializer(many=True, read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    customer_name = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = RoomServiceOrder
        fields = ['id', 'room', 'room_number', 'customer_name', 'order_number', 
                 'status', 'payment_status', 'notes', 'ordered_at', 'completed_at',
                 'total_amount', 'total_items', 'items']
    
    def get_customer_name(self, obj):
        # Lấy booking hiện tại của phòng
        current_booking = obj.room.bookings.filter(
            check_in_date__lte=obj.ordered_at.date(),
            check_out_date__gte=obj.ordered_at.date()
        ).first()
        if current_booking and current_booking.customer:
            return current_booking.customer.full_name
        return "Khách vãng lai"
    
    def get_total_amount(self, obj):
        return sum(item.quantity * item.unit_price for item in obj.items.all())
    
    def get_total_items(self, obj):
        return obj.items.count()


class CreateRoomServiceOrderSerializer(serializers.ModelSerializer):
    items = serializers.JSONField()
    
    class Meta:
        model = RoomServiceOrder
        fields = ['room', 'notes', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = RoomServiceOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            service = Service.objects.get(id=item_data['service_id'])
            RoomServiceItem.objects.create(
                order=order,
                service=service,
                quantity=item_data['quantity'],
                unit_price=service.price,
                notes=item_data.get('notes', '')
            )
        
        return order