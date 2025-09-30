from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Customer
from .serializers import CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if query:
            customers = self.queryset.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(email__icontains=query) |
                Q(phone__icontains=query) |
                Q(customer_id__icontains=query) |
                Q(id_card_number__icontains=query)
            )
            serializer = self.get_serializer(customers, many=True)
            return Response(serializer.data)
        return Response([])
    
    @action(detail=False, methods=['get'])
    def vip_customers(self, request):
        vip_customers = self.queryset.filter(is_vip=True)
        serializer = self.get_serializer(vip_customers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def toggle_vip(self, request, pk=None):
        customer = self.get_object()
        customer.is_vip = not customer.is_vip
        customer.save()
        return Response({'status': 'VIP status updated', 'is_vip': customer.is_vip})