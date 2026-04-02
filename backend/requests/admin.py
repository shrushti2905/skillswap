from django.contrib import admin
from .models import SwapRequest

@admin.register(SwapRequest)
class SwapRequestAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'skill_offered', 'skill_requested', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('sender__email', 'receiver__email', 'skill_offered', 'skill_requested')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
