from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, RoomTypeViewSet, BookingViewSet
from .statistics_views import StatisticsViewSet

router = DefaultRouter()
router.register(r'types', RoomTypeViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'statistics', StatisticsViewSet, basename='statistics')
router.register(r'', RoomViewSet)

urlpatterns = [
    path('', include(router.urls)),
]