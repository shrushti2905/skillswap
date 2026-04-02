import os
import django
import bcrypt

# Setup Django FIRST
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillswap.settings')
django.setup()

# Now import Django models
from django.contrib.auth import get_user_model
from requests.models import SwapRequest
from notifications.models import Notification

User = get_user_model()

def create_admin_users():
    """Create admin users"""
    admin_users = [
        {
            'email': 'shrushtipatil2905@gmail.com',
            'password': 'Admin@123',
            'name': 'Shrushti Patil',
            'role': 'admin'
        },
        {
            'email': 'roshroshi778@gmail.com',
            'password': 'Admin@123',
            'name': 'Roshni',
            'role': 'admin'
        }
    ]
    
    for admin_data in admin_users:
        if not User.objects.filter(email=admin_data['email']).exists():
            user = User.objects.create_user(
                username=admin_data['email'],
                email=admin_data['email'],
                password=admin_data['password'],
                first_name=admin_data['name'],
                role=admin_data['role'],
                is_staff=True,
                is_superuser=True
            )
            print(f"Created admin: {admin_data['email']}")

def create_sample_users():
    """Create sample users with skills"""
    sample_users = [
        {
            'email': 'john.doe@example.com',
            'password': 'password123',
            'name': 'John Doe',
            'bio': 'Experienced web developer passionate about teaching',
            'location': 'New York',
            'skills_offered': ['JavaScript', 'React', 'Node.js'],
            'skills_wanted': ['Python', 'Machine Learning'],
            'availability': ['Weekends', 'Evenings']
        },
        {
            'email': 'jane.smith@example.com',
            'password': 'password123',
            'name': 'Jane Smith',
            'bio': 'Graphic designer looking to learn coding',
            'location': 'San Francisco',
            'skills_offered': ['UI Design', 'Photoshop', 'Illustrator'],
            'skills_wanted': ['HTML', 'CSS', 'JavaScript'],
            'availability': ['Weekdays']
        },
        {
            'email': 'mike.wilson@example.com',
            'password': 'password123',
            'name': 'Mike Wilson',
            'bio': 'Music teacher and producer',
            'location': 'Los Angeles',
            'skills_offered': ['Guitar', 'Piano', 'Music Theory'],
            'skills_wanted': ['Audio Engineering', 'Music Production Software'],
            'availability': ['Flexible']
        },
        {
            'email': 'sarah.jones@example.com',
            'password': 'password123',
            'name': 'Sarah Jones',
            'bio': 'Language enthusiast and traveler',
            'location': 'Chicago',
            'skills_offered': ['Spanish', 'French', 'English Teaching'],
            'skills_wanted': ['Mandarin', 'Japanese', 'German'],
            'availability': ['Weekends']
        },
        {
            'email': 'david.brown@example.com',
            'password': 'password123',
            'name': 'David Brown',
            'bio': 'Fitness trainer and nutrition expert',
            'location': 'Austin',
            'skills_offered': ['Personal Training', 'Yoga', 'Nutrition Planning'],
            'skills_wanted': ['Business Management', 'Marketing'],
            'availability': ['Early Morning', 'Evenings']
        }
    ]
    
    for user_data in sample_users:
        if not User.objects.filter(email=user_data['email']).exists():
            user = User.objects.create_user(
                username=user_data['email'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['name'],
                bio=user_data['bio'],
                location=user_data['location'],
                skills_offered=user_data['skills_offered'],
                skills_wanted=user_data['skills_wanted'],
                availability=user_data['availability'],
                role='user'
            )
            print(f"Created user: {user_data['email']}")

def create_sample_requests():
    """Create sample swap requests"""
    users = User.objects.filter(role='user')
    
    if len(users) >= 2:
        # Create a few sample requests
        requests_data = [
            {
                'sender': users[0],
                'receiver': users[1],
                'skill_offered': 'JavaScript',
                'skill_requested': 'UI Design',
                'message': 'I can teach you JavaScript basics in exchange for UI design lessons!'
            },
            {
                'sender': users[2],
                'receiver': users[0],
                'skill_offered': 'Guitar',
                'skill_requested': 'React',
                'message': 'Would love to learn React while teaching guitar!'
            },
            {
                'sender': users[3],
                'receiver': users[2],
                'skill_offered': 'Spanish',
                'skill_requested': 'Music Theory',
                'message': 'I can teach Spanish if you can help with music theory'
            }
        ]
        
        for req_data in requests_data:
            if not SwapRequest.objects.filter(
                sender=req_data['sender'],
                receiver=req_data['receiver'],
                skill_offered=req_data['skill_offered']
            ).exists():
                request = SwapRequest.objects.create(**req_data)
                print(f"Created request: {req_data['sender'].email} -> {req_data['receiver'].email}")

def create_notifications():
    """Create sample notifications"""
    users = User.objects.all()[:3]
    
    for user in users:
        if not Notification.objects.filter(user=user).exists():
            Notification.objects.create(
                user=user,
                message="Welcome to SkillSwap! Start exploring skills and connect with others."
            )
            print(f"Created notification for: {user.email}")

def main():
    """Main seeding function"""
    print("Starting database seeding...")
    
    # Create admin users
    create_admin_users()
    
    # Create sample users
    create_sample_users()
    
    # Create sample requests
    create_sample_requests()
    
    # Create notifications
    create_notifications()
    
    print("Database seeding completed!")

if __name__ == '__main__':
    main()
