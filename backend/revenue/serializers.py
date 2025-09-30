from rest_framework import serializers
from .models import RevenueReport, Payment, PaymentMethod
from rooms.serializers import BookingSerializer
from services.serializers import ServiceOrderSerializer

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    booking_detail = BookingSerializer(source='booking', read_only=True)
    service_order_detail = ServiceOrderSerializer(source='service_order', read_only=True)
    payment_method_detail = PaymentMethodSerializer(source='payment_method', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        exclude = ['payment_id', 'created_at']

class RevenueReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueReport
        fields = '__all__'