from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AccountViewSet, CustomerProfileViewSet, EmployeeProfileViewSet,
    CustomerViewSet, EmployeeViewSet
)

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'customer-profiles', CustomerProfileViewSet)
router.register(r'employee-profiles', EmployeeProfileViewSet)
router.register(r'customers', CustomerViewSet, basename='customers')
router.register(r'employees', EmployeeViewSet, basename='employees')

urlpatterns = [
    path('', include(router.urls)),
]