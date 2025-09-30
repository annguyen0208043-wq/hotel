from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Account, CustomerProfile, EmployeeProfile

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'user_type', 'phone', 'address', 'date_of_birth', 
                 'is_verified', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class CustomerProfileSerializer(serializers.ModelSerializer):
    user = AccountSerializer(read_only=True)
    
    class Meta:
        model = CustomerProfile
        fields = '__all__'

class EmployeeProfileSerializer(serializers.ModelSerializer):
    user = AccountSerializer(read_only=True)
    
    class Meta:
        model = EmployeeProfile
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirmPassword = serializers.CharField(write_only=True)
    
    class Meta:
        model = Account
        fields = ['username', 'email', 'password', 'confirmPassword', 
                 'first_name', 'last_name', 'phone', 'address', 'date_of_birth', 'user_type']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirmPassword']:
            raise serializers.ValidationError({"confirmPassword": "Mật khẩu không khớp"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirmPassword')
        password = validated_data.pop('password')
        user = Account.objects.create_user(password=password, **validated_data)
        
        # Tự động tạo profile tương ứng
        if user.user_type == 'customer':
            CustomerProfile.objects.create(user=user)
        elif user.user_type == 'employee':
            EmployeeProfile.objects.create(
                user=user,
                employee_id=f"EMP{user.id:04d}"
            )
        
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Thông tin đăng nhập không chính xác')
            if not user.is_active:
                raise serializers.ValidationError('Tài khoản đã bị khóa')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Vui lòng nhập đầy đủ thông tin')
        
        return attrs