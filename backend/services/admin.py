from django.contrib import admin
from .models import Service, ServiceCategory, RoomServiceOrder, RoomServiceItem

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'sort_order']
    list_filter = ['is_active']
    search_fields = ['name']
    ordering = ['sort_order']

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'unit', 'is_available']
    list_filter = ['category', 'is_available']
    search_fields = ['name', 'description']
    ordering = ['category', 'name']

class RoomServiceItemInline(admin.TabularInline):
    model = RoomServiceItem
    extra = 0

@admin.register(RoomServiceOrder)
class RoomServiceOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'room', 'status', 'payment_status', 'ordered_at']
    list_filter = ['status', 'payment_status', 'ordered_at']
    search_fields = ['room__room_number']
    ordering = ['-ordered_at']
    inlines = [RoomServiceItemInline]
    readonly_fields = ['ordered_at']