from rest_framework import serializers
from .models import SwapRequest

class SwapRequestSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    receiver = serializers.SerializerMethodField()
    
    class Meta:
        model = SwapRequest
        fields = ['id', 'sender', 'receiver', 'skill_offered', 'skill_requested', 'message', 'status', 'milestone', 'created_at']
    
    def get_sender(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.sender).data
    
    def get_receiver(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.receiver).data

class CreateSwapRequestSerializer(serializers.Serializer):
    receiver_id = serializers.IntegerField()
    skill_offered = serializers.CharField()
    skill_requested = serializers.CharField()
    message = serializers.CharField(required=False, allow_blank=True)

class UpdateRequestSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=SwapRequest.STATUS_CHOICES)
