from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Account, CustomerProfile, EmployeeProfile

class AccountSerializer(serializers.ModelSerializer):
    id_card_number = serializers.SerializerMethodField()
    
    class Meta:
        model = Account
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'user_type', 'phone', 'address', 'date_of_birth', 
                 'is_verified', 'is_active', 'date_joined', 'id_card_number']
        read_only_fields = ['id', 'date_joined']
    
    def get_id_card_number(self, obj):
        """Lấy id_card_number từ profile tương ứng"""
        if hasattr(obj, 'customer_profile'):
            return obj.customer_profile.id_card_number
        return None

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
    id_card_number = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Account
        fields = ['username', 'email', 'password', 'confirmPassword', 
                 'first_name', 'last_name', 'phone', 'address', 'date_of_birth', 
                 'user_type', 'id_card_number']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirmPassword']:
            raise serializers.ValidationError({"confirmPassword": "Mật khẩu không khớp"})
        return attrs
    
    def create(self, validated_data):
        # Lấy id_card_number trước khi tạo user
        id_card_number = validated_data.pop('id_card_number', None)
        
        # Tự động set is_verified dựa trên việc có CCCD
        if id_card_number and len(id_card_number.strip()) > 0:
            validated_data['is_verified'] = True
        else:
            validated_data['is_verified'] = False
            
        validated_data.pop('confirmPassword')
        password = validated_data.pop('password')
        user = Account.objects.create_user(password=password, **validated_data)
        
        # Tự động tạo profile tương ứng
        if user.user_type == 'customer':
            CustomerProfile.objects.create(
                user=user,
                id_card_number=id_card_number if id_card_number else None
            )
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

class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Serializer cho admin tạo user (có password)"""
    password = serializers.CharField(write_only=True, min_length=6)
    id_card_number = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Account
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 
                 'phone', 'address', 'date_of_birth', 'user_type', 'is_active', 'id_card_number']
    
    def create(self, validated_data):
        print(f"AdminUserCreateSerializer.create called with: {validated_data}")  # Debug log
        id_card_number = validated_data.pop('id_card_number', None)
        print(f"Extracted id_card_number: {id_card_number}")  # Debug log
        
        # Tự động set is_verified dựa trên việc có CCCD
        if id_card_number and len(id_card_number.strip()) > 0:
            validated_data['is_verified'] = True
        else:
            validated_data['is_verified'] = False
        
        password = validated_data.pop('password')
        user = Account.objects.create_user(password=password, **validated_data)
        print(f"Created Account: {user.username}, user_type: {user.user_type}, is_verified: {user.is_verified}")  # Debug log
        
        # Tự động tạo profile tương ứng
        if user.user_type == 'customer':
            CustomerProfile.objects.create(
                user=user,
                id_card_number=id_card_number if id_card_number else None
            )
            print(f"Created CustomerProfile with CCCD: {id_card_number}")  # Debug log
        elif user.user_type == 'employee':
            EmployeeProfile.objects.create(
                user=user,
                employee_id=f"EMP{user.id:04d}"
            )
            print(f"Created EmployeeProfile")  # Debug log
        
        return user

class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Serializer cho admin update user (không có password)"""
    id_card_number = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Account
        fields = ['username', 'email', 'first_name', 'last_name', 
                 'phone', 'address', 'date_of_birth', 'user_type', 'is_active', 'id_card_number']
    
    def update(self, instance, validated_data):
        print(f"AdminUserUpdateSerializer.update called with: {validated_data}")  # Debug log
        id_card_number = validated_data.pop('id_card_number', None)
        print(f"Extracted id_card_number: {id_card_number}")  # Debug log
        
        # Tự động set is_verified dựa trên việc có CCCD
        if id_card_number and len(id_card_number.strip()) > 0:
            validated_data['is_verified'] = True
        else:
            validated_data['is_verified'] = False
        
        # Cập nhật Account
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        print(f"Updated Account: {instance.username}, is_verified: {instance.is_verified}")  # Debug log
        
        # Cập nhật id_card_number trong profile
        if instance.user_type == 'customer':
            # Tạo CustomerProfile nếu chưa có
            customer_profile, created = CustomerProfile.objects.get_or_create(
                user=instance,
                defaults={'id_card_number': id_card_number}
            )
            if not created:
                customer_profile.id_card_number = id_card_number
                customer_profile.save()
            print(f"CustomerProfile {'created' if created else 'updated'} with CCCD: {id_card_number}")  # Debug log
        
        return instance