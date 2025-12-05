from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AccountViewSet, CustomerProfileViewSet, EmployeeProfileViewSet,
    CustomerViewSet, EmployeeViewSet, AdminEmployeeViewSet, AdminCustomerViewSet
)

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'customer-profiles', CustomerProfileViewSet)
router.register(r'employee-profiles', EmployeeProfileViewSet)
router.register(r'customers', CustomerViewSet, basename='customers')
router.register(r'employees', EmployeeViewSet, basename='employees')
# Admin management endpoints
router.register(r'admin/employees', AdminEmployeeViewSet, basename='admin-employees')
router.register(r'admin/customers', AdminCustomerViewSet, basename='admin-customers')

urlpatterns = [
    path('', include(router.urls)),
    # Shortcut for profile endpoint
    path('profile/', AccountViewSet.as_view({'get': 'profile', 'put': 'profile'}), name='profile'),
]