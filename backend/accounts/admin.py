from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'role', 'is_blocked', 'date_joined')
    list_filter = ('role', 'is_blocked', 'is_staff', 'is_superuser')
    search_fields = ('email', 'first_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'bio', 'location', 'profile_image')}),
        ('Skills', {'fields': ('skills_offered', 'skills_wanted', 'availability')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'is_blocked', 'is_public', 'groups', 'user_permissions')}),
        ('Rating', {'fields': ('rating', 'rating_count')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'role'),
        }),
    )
