from django.urls import path
from . import views

urlpatterns = [
    path('requests/', views.list_requests, name='requests_root'),
    path('requests/<int:id>/accept/', views.accept_request, name='accept_request'),
    path('requests/<int:id>/reject/', views.reject_request, name='reject_request'),
    path('requests/<int:id>/complete/', views.complete_request, name='complete_request'),
    path('requests/<int:id>/milestone/', views.update_milestone, name='update_milestone'),
    path('requests/<int:id>/messages/', views.swap_messages, name='swap_messages'),
    path('requests/<int:id>/', views.delete_request, name='delete_request'),
]
