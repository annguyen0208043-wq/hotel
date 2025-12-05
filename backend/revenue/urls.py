from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RevenueReportViewSet, 
    PaymentViewSet, 
    PaymentMethodViewSet,
    revenue_dashboard,
    revenue_chart,
    customer_analytics
)

router = DefaultRouter()
router.register(r'reports', RevenueReportViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'payment-methods', PaymentMethodViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', revenue_dashboard, name='revenue-dashboard'),
    path('chart/', revenue_chart, name='revenue-chart'),
    path('customer-analytics/', customer_analytics, name='customer-analytics'),
]