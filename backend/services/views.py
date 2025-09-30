from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum
from django.utils import timezone
from datetime import datetime
import uuid
from .models import Service, ServiceCategory, ServiceOrder
from .serializers import (
    ServiceSerializer, ServiceCategorySerializer,
    ServiceOrderSerializer, ServiceOrderCreateSerializer
)

class ServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.filter(is_available=True)
    serializer_class = ServiceSerializer
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category_id = request.query_params.get('category_id')
        if category_id:
            services = self.queryset.filter(category_id=category_id)
            serializer = self.get_serializer(services, many=True)
            return Response(serializer.data)
        return Response({'error': 'category_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        # Lấy top 10 dịch vụ được đặt nhiều nhất
        popular_services = ServiceOrder.objects.filter(
            status__in=['completed', 'in_progress']
        ).values('service').annotate(
            total_orders=Sum('quantity')
        ).order_by('-total_orders')[:10]
        
        service_ids = [item['service'] for item in popular_services]
        services = self.queryset.filter(id__in=service_ids)
        serializer = self.get_serializer(services, many=True)
        return Response(serializer.data)

class ServiceOrderViewSet(viewsets.ModelViewSet):
    queryset = ServiceOrder.objects.all().order_by('-created_at')
    serializer_class = ServiceOrderSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ServiceOrderCreateSerializer
        return ServiceOrderSerializer
    
    def perform_create(self, serializer):
        # Tạo order_id tự động
        order_id = f"SO{timezone.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:6].upper()}"
        serializer.save(
            order_id=order_id,
            created_by=self.request.user if hasattr(self.request.user, 'employee_id') else None
        )
    
    @action(detail=False, methods=['get'])
    def today_orders(self, request):
        today = timezone.now().date()
        orders = self.queryset.filter(created_at__date=today)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_orders(self, request):
        orders = self.queryset.filter(status='pending')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_employee(self, request):
        employee_id = request.query_params.get('employee_id')
        if employee_id:
            orders = self.queryset.filter(assigned_employee_id=employee_id)
            serializer = self.get_serializer(orders, many=True)
            return Response(serializer.data)
        return Response({'error': 'employee_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def assign_employee(self, request, pk=None):
        order = self.get_object()
        employee_id = request.data.get('employee_id')
        if employee_id:
            order.assigned_employee_id = employee_id
            order.status = 'confirmed'
            order.save()
            return Response({'status': 'Employee assigned successfully'})
        return Response({'error': 'employee_id required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(ServiceOrder.STATUS_CHOICES):
            order.status = new_status
            if new_status == 'completed':
                order.completed_time = timezone.now()
            order.save()
            return Response({'status': 'Order status updated'})
        return Response({'error': 'Invalid status'}, 
                       status=status.HTTP_400_BAD_REQUEST)