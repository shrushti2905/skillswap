from django.urls import path
from . import views

urlpatterns = [
    path('notifications', views.list_notifications, name='list_notifications'),
    path('notifications/read-all', views.mark_all_read, name='mark_all_read'),
    path('notifications/<int:id>/read', views.mark_notification_read, name='mark_notification_read'),
]
