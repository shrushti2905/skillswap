from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    skills_offered = models.JSONField(default=list, blank=True)
    skills_wanted = models.JSONField(default=list, blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    profile_image = models.URLField(blank=True)
    is_blocked = models.BooleanField(default=False)
    availability = models.JSONField(default=list, blank=True)
    is_public = models.BooleanField(default=True)
    rating = models.FloatField(null=True, blank=True)
    rating_count = models.IntegerField(default=0)
    
    def __str__(self):
        return self.email

class Review(models.Model):
    reviewer = models.ForeignKey(User, related_name='reviews_given', on_delete=models.CASCADE)
    reviewee = models.ForeignKey(User, related_name='reviews_received', on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reviewer.username} -> {self.reviewee.username}: {self.rating} stars"
