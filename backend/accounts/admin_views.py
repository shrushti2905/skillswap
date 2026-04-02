from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import models
from requests.models import SwapRequest

User = get_user_model()

@api_view(['GET'])
def admin_stats(request):
    if not request.user.is_staff:
        return Response({
            'error': 'Forbidden',
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    blocked_users = User.objects.filter(is_blocked=True).count()
    total_requests = SwapRequest.objects.count()
    pending_requests = SwapRequest.objects.filter(status='pending').count()
    completed_requests = SwapRequest.objects.filter(status='completed').count()
    
    return Response({
        'totalUsers': total_users,
        'activeUsers': active_users,
        'blockedUsers': blocked_users,
        'totalRequests': total_requests,
        'pendingRequests': pending_requests,
        'completedRequests': completed_requests
    })

@api_view(['GET', 'POST'])
def admin_list_users(request):
    if not request.user.is_staff:
        return Response({
            'error': 'Forbidden',
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'POST':
        from accounts.serializers import SignupSerializer, UserSerializer
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            role = request.data.get('role', 'user')
            is_staff = role == 'admin'
            user = User.objects.create_user(
                username=data['email'],
                email=data['email'],
                password=data['password'],
                first_name=data['name'],
                role=role,
                is_staff=is_staff,
                is_superuser=is_staff
            )
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response({'error': 'Bad Request', 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    search = request.GET.get('search')
    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 20))
    users = User.objects.all().order_by('-date_joined')
    if search:
        users = users.filter(
            models.Q(email__icontains=search) | 
            models.Q(first_name__icontains=search)
        )
    total = users.count()
    start = (page - 1) * limit
    end = start + limit
    users = users[start:end]
    from accounts.serializers import UserSerializer
    serializer = UserSerializer(users, many=True)
    return Response({
        'users': serializer.data,
        'total': total,
        'page': page,
        'limit': limit
    })

@api_view(['PUT'])
def admin_block_user(request, id):
    if not request.user.is_staff:
        return Response({
            'error': 'Forbidden',
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=id)
        user.is_blocked = True
        user.save()
        
        from accounts.serializers import UserSerializer
        return Response(UserSerializer(user).data)
        
    except User.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def admin_unblock_user(request, id):
    if not request.user.is_staff:
        return Response({
            'error': 'Forbidden',
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=id)
        user.is_blocked = False
        user.save()
        
        from accounts.serializers import UserSerializer
        return Response(UserSerializer(user).data)
        
    except User.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def admin_delete_user(request, id):
    if not request.user.is_staff:
        return Response({
            'error': 'Forbidden',
            'message': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=id)
        user.delete()
        
        return Response({'message': 'User deleted successfully'})
        
    except User.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
