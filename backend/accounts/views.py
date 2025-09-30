from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from .models import Account, CustomerProfile, EmployeeProfile
from .serializers import (
    AccountSerializer, CustomerProfileSerializer, 
    EmployeeProfileSerializer, RegisterSerializer, LoginSerializer
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
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        user = request.user
        data = AccountSerializer(user).data
        
        # Thêm thông tin profile tương ứng
        if hasattr(user, 'customer_profile'):
            data['profile'] = CustomerProfileSerializer(user.customer_profile).data
        elif hasattr(user, 'employee_profile'):
            data['profile'] = EmployeeProfileSerializer(user.employee_profile).data
        
        return Response(data)
    
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
