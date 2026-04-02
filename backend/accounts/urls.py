from django.urls import path
from . import views, admin_views

urlpatterns = [
    path('auth/signup', views.signup, name='signup'),
    path('auth/login', views.login, name='login'),
    path('auth/me', views.me, name='me'),
    path('users', views.list_users, name='list_users'),
    path('users/me/profile', views.get_profile, name='profile'),
    path('users/me/skills/offered', views.add_skill_offered, name='skills_offered'),
    path('users/me/skills/wanted', views.add_skill_wanted, name='skills_wanted'),
    path('users/<int:id>', views.get_user_by_id, name='get_user_by_id'),
    path('users/<int:id>/review', views.add_review, name='add_review'),
    # Admin endpoints
    path('admin/stats', admin_views.admin_stats, name='admin_stats'),
    path('admin/users', admin_views.admin_list_users, name='admin_list_users'),
    path('admin/users/<int:id>/block', admin_views.admin_block_user, name='admin_block_user'),
    path('admin/users/<int:id>/unblock', admin_views.admin_unblock_user, name='admin_unblock_user'),
    path('admin/users/<int:id>', admin_views.admin_delete_user, name='admin_delete_user'),
]
