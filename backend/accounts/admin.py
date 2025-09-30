from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Account, CustomerProfile, EmployeeProfile

@admin.register(Account)
class AccountAdmin(UserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_verified', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_verified', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = (
        (None, {'fields': ('username',)}),
        ('Đổi mật khẩu', {
            'fields': (),
            'description': 'Sử dụng <a href="../password/">form này</a> để đổi mật khẩu người dùng.'
        }),
        ('Thông tin cá nhân', {'fields': ('first_name', 'last_name', 'email')}),
        ('Quyền hạn', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Ngày quan trọng', {'fields': ('last_login', 'date_joined')}),
        ('Thông tin bổ sung', {
            'fields': ('user_type', 'phone', 'address', 'date_of_birth', 'avatar', 'is_verified')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
        ('Thông tin bổ sung', {
            'fields': ('user_type', 'phone', 'address', 'date_of_birth', 'is_verified')
        }),
    )
    
    readonly_fields = ('last_login', 'date_joined')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if hasattr(request.user, 'user_type') and request.user.user_type == 'admin':
            return qs
        return qs.filter(id=request.user.id)

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'id_card_number', 'nationality', 'is_vip', 'emergency_contact')
    list_filter = ('nationality', 'is_vip')
    search_fields = ('user__username', 'user__email', 'id_card_number')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if hasattr(request.user, 'user_type') and request.user.user_type != 'admin':
            return qs.filter(user=request.user)
        return qs

@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'employee_id', 'position', 'department', 'salary', 'shift', 'hire_date')
    list_filter = ('position', 'department', 'shift', 'hire_date')
    search_fields = ('user__username', 'user__email', 'employee_id')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if hasattr(request.user, 'user_type') and request.user.user_type != 'admin':
            return qs.filter(user=request.user)
        return qs
