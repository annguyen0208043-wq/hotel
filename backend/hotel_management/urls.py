from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/employees/', include('employees.urls')),
    path('api/customers/', include('customers.urls')),
    path('api/rooms/', include('rooms.urls')),
    path('api/services/', include('services.urls')),
    path('api/revenue/', include('revenue.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)