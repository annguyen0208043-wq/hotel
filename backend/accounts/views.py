from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from .models import Account, CustomerProfile, EmployeeProfile
from .serializers import (
    AccountSerializer, CustomerProfileSerializer, 
    EmployeeProfileSerializer, RegisterSerializer, LoginSerializer,
    AdminUserCreateSerializer, AdminUserUpdateSerializer
)

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'user_type') and user.user_type == 'admin':
            return Account.objects.all()
        return Account.objects.filter(id=user.id)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': AccountSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Đăng ký thành công!'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': AccountSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Đăng nhập thành công!'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get', 'put'])
    def profile(self, request):
        user = request.user
        
        if request.method == 'GET':
            data = AccountSerializer(user).data
            
            # Thêm thông tin profile tương ứng
            if hasattr(user, 'customer_profile'):
                data['profile'] = CustomerProfileSerializer(user.customer_profile).data
            elif hasattr(user, 'employee_profile'):
                data['profile'] = EmployeeProfileSerializer(user.employee_profile).data
            
            return Response(data)
        
        elif request.method == 'PUT':
            # Cập nhật thông tin profile
            data = request.data.copy()
            id_card_number = data.pop('id_card_number', None)
            
            # Cập nhật Account fields
            serializer = AccountSerializer(user, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                # Cập nhật CustomerProfile nếu là customer
                if user.user_type == 'customer':
                    customer_profile, created = CustomerProfile.objects.get_or_create(
                        user=user,
                        defaults={'id_card_number': id_card_number}
                    )
                    if not created and id_card_number is not None:
                        customer_profile.id_card_number = id_card_number
                        customer_profile.save()
                    
                    # Cập nhật trạng thái is_verified dựa trên CCCD
                    user.is_verified = bool(customer_profile.id_card_number)
                    user.save()
                
                # Trả về dữ liệu mới
                updated_data = AccountSerializer(user).data
                if hasattr(user, 'customer_profile'):
                    updated_data['profile'] = CustomerProfileSerializer(user.customer_profile).data
                
                return Response(updated_data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not user.check_password(old_password):
            return Response({'error': 'Mật khẩu cũ không chính xác'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Đổi mật khẩu thành công!'})

class CustomerProfileViewSet(viewsets.ModelViewSet):
    queryset = CustomerProfile.objects.all()
    serializer_class = CustomerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'user_type') and user.user_type == 'admin':
            return CustomerProfile.objects.all()
        return CustomerProfile.objects.filter(user=user)

class EmployeeProfileViewSet(viewsets.ModelViewSet):
    queryset = EmployeeProfile.objects.all()
    serializer_class = EmployeeProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'user_type') and user.user_type == 'admin':
            return EmployeeProfile.objects.all()
        return EmployeeProfile.objects.filter(user=user)

# Separate ViewSets for different user types
class CustomerViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Đăng ký tài khoản khách hàng"""
        print(f"Register data received: {request.data}")  # Debug log
        
        data = request.data.copy()
        data['user_type'] = 'customer'
        
        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': AccountSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Đăng ký thành công!'
            }, status=status.HTTP_201_CREATED)
        
        print(f"Register validation errors: {serializer.errors}")  # Debug log
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Đăng nhập khách hàng"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            if user.user_type != 'customer':
                return Response({'error': 'Tài khoản không hợp lệ'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': AccountSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Đăng nhập thành công!'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
        """Lấy thông tin profile khách hàng"""
        user = request.user
        if user.user_type != 'customer':
            return Response({'error': 'Không có quyền truy cập'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        data = AccountSerializer(user).data
        if hasattr(user, 'customer_profile'):
            data['profile'] = CustomerProfileSerializer(user.customer_profile).data
        
        return Response(data)

class EmployeeViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Đăng nhập nhân viên/admin"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            if user.user_type not in ['employee', 'admin']:
                return Response({'error': 'Tài khoản không hợp lệ'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': AccountSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Đăng nhập thành công!'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
        """Lấy thông tin profile nhân viên"""
        user = request.user
        if user.user_type not in ['employee', 'admin']:
            return Response({'error': 'Không có quyền truy cập'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        data = AccountSerializer(user).data
        if hasattr(user, 'employee_profile'):
            data['profile'] = EmployeeProfileSerializer(user.employee_profile).data
        
        return Response(data)

# Admin Management ViewSets
class AdminEmployeeViewSet(viewsets.ModelViewSet):
    """Admin và Employee quản lý nhân viên"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Admin, superuser và employee có quyền truy cập
        user_type = getattr(self.request.user, 'user_type', None)
        print(f"User: {self.request.user}, Type: {user_type}, Is superuser: {self.request.user.is_superuser}")
        if not (self.request.user.is_superuser or user_type in ['admin', 'employee']):
            return Account.objects.none()
        return Account.objects.filter(user_type__in=['employee', 'admin'])
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AdminUserUpdateSerializer
        return AccountSerializer
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Ngăn admin tự sửa thông tin chính mình
        if request.user.id == instance.id:
            return Response(
                {'error': 'Không thể tự chỉnh sửa thông tin tài khoản của chính mình'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Ngăn admin tự xóa tài khoản chính mình
        if request.user.id == instance.id:
            return Response(
                {'error': 'Không thể tự xóa tài khoản của chính mình'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Ngăn xóa tài khoản admin (chỉ cho phép vô hiệu hóa)
        if instance.user_type == 'admin':
            return Response(
                {'error': 'Không thể xóa tài khoản admin. Vui lòng sử dụng chức năng vô hiệu hóa.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)

class AdminCustomerViewSet(viewsets.ModelViewSet):
    """Admin và Employee quản lý khách hàng"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Admin, superuser và employee có quyền truy cập
        user_type = getattr(self.request.user, 'user_type', None)
        if not (self.request.user.is_superuser or user_type in ['admin', 'employee']):
            return Account.objects.none()
        return Account.objects.filter(user_type='customer')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AdminUserUpdateSerializer
        return AccountSerializer
    
    def perform_create(self, serializer):
        # Đảm bảo user_type là customer
        serializer.save(user_type='customer')
