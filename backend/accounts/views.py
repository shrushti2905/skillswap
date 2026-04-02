from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import models
from .serializers import SignupSerializer, LoginSerializer, UserSerializer, ProfileUpdateSerializer, SkillSerializer
from .authentication import generate_token
import bcrypt

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        
        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            first_name=data['name'],
            password=data['password'],
            role='user'
        )
        
        token = generate_token(user)
        user_serializer = UserSerializer(user)
        
        return Response({
            'token': token,
            'user': user_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': 'Bad Request',
        'message': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token = generate_token(user)
        user_serializer = UserSerializer(user)
        
        return Response({
            'token': token,
            'user': user_serializer.data
        })
    
    return Response({
        'error': 'Unauthorized',
        'message': serializer.errors.get('non_field_errors', ['Invalid credentials'])[0]
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
def list_users(request):
    search = request.GET.get('search')
    skill = request.GET.get('skill')
    sort = request.GET.get('sort')
    availability = request.GET.get('availability')
    location = request.GET.get('location')
    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 20))
    
    users = User.objects.filter(is_blocked=False)
    
    if search:
        users = users.filter(
            models.Q(first_name__icontains=search) | 
            models.Q(location__icontains=search)
        )
    
    if skill:
        users = users.filter(
            models.Q(skills_offered__contains=skill) | 
            models.Q(skills_wanted__contains=skill)
        )

    if location:
        users = users.filter(location__icontains=location)
        
    if availability:
        users = users.filter(availability__icontains=availability)

    if sort == 'highest_rated':
        users = users.order_by('-rating', '-rating_count')
    elif sort == 'online_now':
        pass # mock online, just leave as is
    
    total = users.count()
    start = (page - 1) * limit
    end = start + limit
    
    users = users[start:end]
    serializer = UserSerializer(users, many=True)
    
    return Response({
        'users': serializer.data,
        'total': total,
        'page': page,
        'limit': limit
    })

@api_view(['GET', 'PUT'])
def get_profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    serializer = ProfileUpdateSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        if 'name' in data:
            request.user.first_name = data['name']
        if 'bio' in data:
            request.user.bio = data['bio']
        if 'location' in data:
            request.user.location = data['location']
        if 'profile_image' in data:
            request.user.profile_image = data['profile_image']
        if 'availability' in data:
            request.user.availability = data['availability']
        if 'is_public' in data:
            request.user.is_public = data['is_public']
        request.user.save()
        return Response(UserSerializer(request.user).data)
    return Response({
        'error': 'Bad Request',
        'message': 'No fields to update'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_profile(request):
    serializer = ProfileUpdateSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        if 'name' in data:
            request.user.first_name = data['name']
        if 'bio' in data:
            request.user.bio = data['bio']
        if 'location' in data:
            request.user.location = data['location']
        if 'profile_image' in data:
            request.user.profile_image = data['profile_image']
        if 'availability' in data:
            request.user.availability = data['availability']
        if 'is_public' in data:
            request.user.is_public = data['is_public']
        request.user.save()
        return Response(UserSerializer(request.user).data)
    return Response({
        'error': 'Bad Request',
        'message': 'No fields to update'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST', 'DELETE'])
def add_skill_offered(request):
    if request.method == 'DELETE':
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            skill = serializer.validated_data['skill']
            if skill in request.user.skills_offered:
                request.user.skills_offered.remove(skill)
                request.user.save()
            return Response(UserSerializer(request.user).data)
        return Response({
            'error': 'Bad Request',
            'message': 'Skill is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    serializer = SkillSerializer(data=request.data)
    if serializer.is_valid():
        skill = serializer.validated_data['skill']
        if skill in request.user.skills_offered:
            return Response({
                'error': 'Bad Request',
                'message': 'Skill already added'
            }, status=status.HTTP_400_BAD_REQUEST)
        request.user.skills_offered.append(skill)
        request.user.save()
        return Response(UserSerializer(request.user).data)
    return Response({
        'error': 'Bad Request',
        'message': 'Skill is required'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def remove_skill_offered(request):
    serializer = SkillSerializer(data=request.data)
    if serializer.is_valid():
        skill = serializer.validated_data['skill']
        
        if skill in request.user.skills_offered:
            request.user.skills_offered.remove(skill)
            request.user.save()
        
        return Response(UserSerializer(request.user).data)
    
    return Response({
        'error': 'Bad Request',
        'message': 'Skill is required'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST', 'DELETE'])
def add_skill_wanted(request):
    if request.method == 'DELETE':
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            skill = serializer.validated_data['skill']
            if skill in request.user.skills_wanted:
                request.user.skills_wanted.remove(skill)
                request.user.save()
            return Response(UserSerializer(request.user).data)
        return Response({
            'error': 'Bad Request',
            'message': 'Skill is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    serializer = SkillSerializer(data=request.data)
    if serializer.is_valid():
        skill = serializer.validated_data['skill']
        if skill in request.user.skills_wanted:
            return Response({
                'error': 'Bad Request',
                'message': 'Skill already added'
            }, status=status.HTTP_400_BAD_REQUEST)
        request.user.skills_wanted.append(skill)
        request.user.save()
        return Response(UserSerializer(request.user).data)
    return Response({
        'error': 'Bad Request',
        'message': 'Skill is required'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def remove_skill_wanted(request):
    serializer = SkillSerializer(data=request.data)
    if serializer.is_valid():
        skill = serializer.validated_data['skill']
        
        if skill in request.user.skills_wanted:
            request.user.skills_wanted.remove(skill)
            request.user.save()
        
        return Response(UserSerializer(request.user).data)
    
    return Response({
        'error': 'Bad Request',
        'message': 'Skill is required'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def add_review(request, id):
    try:
        reviewee = User.objects.get(id=id)
        rating = int(request.data.get('rating', 5))
        text = request.data.get('text', '')

        if rating < 1 or rating > 5:
            return Response({'error': 'Bad Request', 'message': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
        
        from .models import Review
        Review.objects.create(
            reviewer=request.user,
            reviewee=reviewee,
            rating=rating,
            text=text
        )

        # Update average rating
        reviews = Review.objects.filter(reviewee=reviewee)
        avg = sum([r.rating for r in reviews]) / reviews.count()
        reviewee.rating = round(avg, 1)
        reviewee.rating_count = reviews.count()
        reviewee.save()

        return Response(UserSerializer(reviewee).data)
    except User.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_user_by_id(request, id):
    try:
        user = User.objects.get(id=id)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
