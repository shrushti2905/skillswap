from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

@api_view(['GET'])
def list_notifications(request):
    notifications = Notification.objects.filter(user=request.user)
    serializer = NotificationSerializer(notifications, many=True)
    
    return Response({
        'notifications': serializer.data
    })

@api_view(['PUT'])
def mark_notification_read(request, id):
    try:
        notification = Notification.objects.get(id=id, user=request.user)
        notification.is_read = True
        notification.save()
        
        return Response(NotificationSerializer(notification).data)
        
    except Notification.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'Notification not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def mark_all_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    
    return Response({'message': 'All notifications marked as read'})
