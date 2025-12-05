from django.urls import path
from .views import (
    ServiceCategoryListView,
    ServiceCategoryDetailView,
    ServiceListView,
    ServiceDetailView,
    RoomServiceOrderListView,
    RoomServiceOrderCreateView,
    RoomServiceOrderDetailView,
    room_service_dashboard,
    service_statistics
)

urlpatterns = [
    # Service categories
    path('categories/', ServiceCategoryListView.as_view(), name='service-categories'),
    path('categories/<int:pk>/', ServiceCategoryDetailView.as_view(), name='service-category-detail'),
    
    # Services
    path('services/', ServiceListView.as_view(), name='services'),
    path('services/<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),
    
    # Room service orders
    path('orders/', RoomServiceOrderListView.as_view(), name='room-service-orders'),
    path('orders/create/', RoomServiceOrderCreateView.as_view(), name='create-room-service-order'),
    path('orders/<int:pk>/', RoomServiceOrderDetailView.as_view(), name='room-service-order-detail'),
    
    # Dashboard
    path('dashboard/', room_service_dashboard, name='room-service-dashboard'),
    
    # Statistics
    path('statistics/', service_statistics, name='service-statistics'),
]