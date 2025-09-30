from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RevenueReportViewSet, PaymentViewSet, PaymentMethodViewSet

router = DefaultRouter()
router.register(r'reports', RevenueReportViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'payment-methods', PaymentMethodViewSet)

urlpatterns = [
    path('', include(router.urls)),
]