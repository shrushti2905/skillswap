from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_info(request):
    return JsonResponse({
        'message': 'SkillSwap API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'users': '/api/users',
            'requests': '/api/requests',
            'notifications': '/api/notifications',
            'admin': '/api/admin/',
            'admin_panel': '/admin/'
        }
    })

urlpatterns = [
    path('', api_info, name='api_info'),
    path('admin/', admin.site.urls),
    path('api/', include('requests.urls')),
    path('api/', include('notifications.urls')),
    path('api/', include('accounts.urls')),
]
