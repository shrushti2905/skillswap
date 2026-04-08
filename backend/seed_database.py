import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "skillswap.settings")
django.setup()

from accounts.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

# Create admin user only
admin_email = "shrushtipatil2905@gmail.com"
admin_password = "admin123"

if not User.objects.filter(email=admin_email).exists():
    User.objects.create_user(
        username="shrushtipatil2905",
        email=admin_email,
        password=admin_password,
        first_name="Shrushti",
        last_name="Patil",
        role="admin",
        is_staff=True,
        is_superuser=True,
        location="Mumbai",
        bio="Platform Administrator",
        skills_offered=["Platform Management"],
        skills_wanted=["Community Feedback"],
        availability=["Weekdays"],
        rating=5.0,
        rating_count=1,
        is_public=True
    )
    print(f"✅ Admin user created: {admin_email}")
    print(f"   Password: {admin_password}")
else:
    print(f"⏭️  Admin user already exists: {admin_email}")

print(f"\n📊 Total users in database: {User.objects.count()}")
print(f"🔐 Django Admin: http://localhost:8000/admin/")
print(f"   Login: {admin_email} / {admin_password}")
