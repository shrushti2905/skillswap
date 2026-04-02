from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import SwapRequest, SwapMessage
from .serializers import SwapRequestSerializer, CreateSwapRequestSerializer, UpdateRequestSerializer
from notifications.models import Notification

User = get_user_model()

@api_view(['GET', 'POST'])
def list_requests(request):
    if request.method == 'POST':
        serializer = CreateSwapRequestSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                receiver = User.objects.get(id=data['receiver_id'])
            except User.DoesNotExist:
                return Response({
                    'error': 'Bad Request',
                    'message': 'Receiver not found'
                }, status=status.HTTP_400_BAD_REQUEST)
            swap_request = SwapRequest.objects.create(
                sender=request.user,
                receiver=receiver,
                skill_offered=data['skill_offered'],
                skill_requested=data['skill_requested'],
                message=data.get('message', '')
            )
            Notification.objects.create(
                user=receiver,
                message=f"New skill swap request from {request.user.email}: {data['skill_offered']} for {data['skill_requested']}"
            )
            return Response(SwapRequestSerializer(swap_request).data, status=status.HTTP_201_CREATED)
        return Response({
            'error': 'Bad Request',
            'message': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    status_filter = request.GET.get('status')
    type_filter = request.GET.get('type')  # 'sent' or 'received'
    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 20))
    
    requests = SwapRequest.objects.all()
    
    if status_filter:
        requests = requests.filter(status=status_filter)
    
    if type_filter == 'sent':
        requests = requests.filter(sender=request.user)
    elif type_filter == 'received':
        requests = requests.filter(receiver=request.user)
    
    total = requests.count()
    start = (page - 1) * limit
    end = start + limit
    
    requests = requests[start:end]
    serializer = SwapRequestSerializer(requests, many=True)
    
    return Response({
        'requests': serializer.data,
        'total': total,
        'page': page,
        'limit': limit
    })

@api_view(['POST'])
def create_request(request):
    serializer = CreateSwapRequestSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        
        try:
            receiver = User.objects.get(id=data['receiver_id'])
        except User.DoesNotExist:
            return Response({
                'error': 'Bad Request',
                'message': 'Receiver not found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent duplicate pending requests
        existing_request = SwapRequest.objects.filter(
            sender=request.user,
            receiver=receiver,
            skill_offered=data['skill_offered'],
            skill_requested=data['skill_requested'],
            status='pending'
        ).exists()

        if existing_request:
            return Response({
                'error': 'Conflict',
                'message': 'A pending request for these skills already exists.'
            }, status=status.HTTP_409_CONFLICT)
        
        swap_request = SwapRequest.objects.create(
            sender=request.user,
            receiver=receiver,
            skill_offered=data['skill_offered'],
            skill_requested=data['skill_requested'],
            message=data.get('message', '')
        )
        
        # Create notification for receiver
        Notification.objects.create(
            user=receiver,
            message=f"New skill swap request from {request.user.email}: {data['skill_offered']} for {data['skill_requested']}"
        )
        
        return Response(SwapRequestSerializer(swap_request).data, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': 'Bad Request',
        'message': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def accept_request(request, id):
    try:
        swap_request = SwapRequest.objects.get(id=id, receiver=request.user, status='pending')
        
        swap_request.status = 'accepted'
        swap_request.save()
        
        # Create notification for sender
        Notification.objects.create(
            user=swap_request.sender,
            message=f"Your skill swap request with {request.user.email} has been accepted!"
        )
        
        return Response(SwapRequestSerializer(swap_request).data)
        
    except SwapRequest.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'Request not found or cannot be accepted'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def reject_request(request, id):
    try:
        swap_request = SwapRequest.objects.get(id=id, receiver=request.user, status='pending')
        
        swap_request.status = 'rejected'
        swap_request.save()
        
        # Create notification for sender
        Notification.objects.create(
            user=swap_request.sender,
            message=f"Your skill swap request with {request.user.email} has been rejected."
        )
        
        return Response(SwapRequestSerializer(swap_request).data)
        
    except SwapRequest.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'Request not found or cannot be rejected'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def complete_request(request, id):
    try:
        swap_request = SwapRequest.objects.get(id=id, receiver=request.user, status='accepted')
        
        swap_request.status = 'completed'
        swap_request.save()
        
        # Create notification for sender
        Notification.objects.create(
            user=swap_request.sender,
            message=f"Your skill swap with {request.user.email} has been marked as completed!"
        )
        
        return Response(SwapRequestSerializer(swap_request).data)
        
    except SwapRequest.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'Request not found or cannot be completed'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_request(request, id):
    try:
        swap_request = SwapRequest.objects.get(id=id, sender=request.user)
        
        # Only allow deletion of pending requests
        if swap_request.status != 'pending':
            return Response({
                'error': 'Bad Request',
                'message': 'Can only delete pending requests'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        swap_request.delete()
        
        return Response({'message': 'Request deleted successfully'})
        
    except SwapRequest.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'Request not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def update_milestone(request, id):
    try:
        # Both sender and receiver can update milestone
        swap_request = SwapRequest.objects.get(id=id, status='accepted')
        if swap_request.sender != request.user and swap_request.receiver != request.user:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        milestone = request.data.get('milestone', '')
        swap_request.milestone = milestone
        swap_request.save()
        
        partner = swap_request.receiver if swap_request.sender == request.user else swap_request.sender
        if milestone:
            Notification.objects.create(
                user=partner,
                message=f"{request.user.first_name} updated swap milestone to: {milestone}"
            )
            
        return Response(SwapRequestSerializer(swap_request).data)
    except SwapRequest.DoesNotExist:
        return Response({'error': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
def swap_messages(request, id):
    try:
        swap_request = SwapRequest.objects.get(id=id)
        if swap_request.sender != request.user and swap_request.receiver != request.user:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        if request.method == 'GET':
            messages = SwapMessage.objects.filter(swap_request=swap_request).order_by('created_at')
            return Response([{
                'id': m.id,
                'sender_id': m.sender.id,
                'sender_name': m.sender.first_name,
                'text': m.text,
                'created_at': m.created_at
            } for m in messages])
            
        elif request.method == 'POST':
            text = request.data.get('text', '')
            if not text:
                return Response({'error': 'Bad Request', 'message': 'Message text is required'}, status=status.HTTP_400_BAD_REQUEST)
            msg = SwapMessage.objects.create(
                swap_request=swap_request,
                sender=request.user,
                text=text
            )
            
            # Create notification for receiver
            partner = swap_request.receiver if swap_request.sender == request.user else swap_request.sender
            Notification.objects.create(
                user=partner,
                message=f"New message from {request.user.first_name}: {text[:30]}..."
            )

            return Response({
                'id': msg.id,
                'sender_id': msg.sender.id,
                'sender_name': msg.sender.first_name,
                'text': msg.text,
                'created_at': msg.created_at
            })
    except SwapRequest.DoesNotExist:
        return Response({'error': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
