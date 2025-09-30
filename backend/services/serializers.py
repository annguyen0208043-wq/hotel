from rest_framework import serializers
from .models import Service, ServiceCategory, ServiceOrder
from customers.serializers import CustomerSerializer
from employees.serializers import EmployeeSerializer
from rooms.serializers import BookingSerializer

class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    category_detail = ServiceCategorySerializer(source='category', read_only=True)
    
    class Meta:
        model = Service
        fields = '__all__'

class ServiceOrderSerializer(serializers.ModelSerializer):
    customer_detail = CustomerSerializer(source='customer', read_only=True)
    booking_detail = BookingSerializer(source='booking', read_only=True)
    service_detail = ServiceSerializer(source='service', read_only=True)
    assigned_employee_detail = EmployeeSerializer(source='assigned_employee', read_only=True)
    created_by_detail = EmployeeSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = ServiceOrder
        fields = '__all__'

class ServiceOrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceOrder
        exclude = ['order_id', 'unit_price', 'total_amount', 'created_by', 'created_at', 'updated_at']
    
    def validate(self, data):
        service = data['service']
        if not service.is_available:
            raise serializers.ValidationError("Dịch vụ này hiện không khả dụng")
        return data