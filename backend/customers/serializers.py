from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Customer
        fields = '__all__'
    
    def validate_email(self, value):
        if Customer.objects.filter(email=value).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError("Email này đã được sử dụng.")
        return value
    
    def validate_id_card_number(self, value):
        if Customer.objects.filter(id_card_number=value).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError("Số CMND/CCCD này đã được sử dụng.")
        return value