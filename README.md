# SkillSwap Platform - Python Django Version

A peer-to-peer skill exchange platform where users offer skills they have and request skills they want to learn — completely free, no money involved.

---

## Features

- **Authentication** — Sign up / sign in with JWT tokens
- **Discover** — Browse and filter users by skill category or search
- **Skill Swap Requests** — Send, accept, reject, and complete swap requests
- **Profile Management** — Manage your bio, skills offered, skills wanted, and availability
- **Notifications** — Real-time notification system for swap activity
- **Admin Panel** — Secure admin dashboard for managing users and platform stats

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML + Tailwind CSS + React (via CDN) |
| Backend | Python Django + Django REST Framework |
| Database | SQLite (for simplicity) |
| Authentication | JWT (PyJWT) + bcrypt |
| Development | Simple JavaScript (no TypeScript) |

---

## Admin Accounts

| Name | Email | Password |
|------|-------|----------|
| Shrushti Patil | shrushtipatil2905@gmail.com | Admin@123 |
| Roshni | roshroshi778@gmail.com | Admin@123 |

---

## Local Setup Guide

### Prerequisites

Make sure the following are installed on your PC:

- **Python** 3.8 or higher — https://www.python.org
- **pip** (usually comes with Python)

---

### Step 1 — Navigate to the backend directory

```bash
cd backend
```

---

### Step 2 — Create a virtual environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

---

### Step 3 — Install dependencies

```bash
pip install -r requirements.txt
```

---

### Step 4 — Set up the database

```bash
python manage.py makemigrations
python manage.py migrate
```

---

### Step 5 — Seed the database

```bash
python seed_database.py
```

This creates:
- 2 admin accounts (Shrushti and Roshni)
- 5 sample users with skills
- Sample swap requests and notifications

---

### Step 6 — Start the Django server

```bash
python manage.py runserver
```

The API will run at `http://localhost:8000`

---

### Step 7 — Open the frontend

Open another terminal window and navigate to the frontend directory:

```bash
cd ../frontend
```

Then open the `index.html` file in your browser:

```bash
# If you have a simple HTTP server
python -m http.server 3000

# Or simply open the file in your browser
open index.html
```

Open your browser at `http://localhost:3000` or directly open the `index.html` file.

---

## Project Structure

```
skillfinal/
├── backend/                    # Django backend
│   ├── skillswap/             # Django project settings
│   ├── accounts/              # User authentication and profiles
│   ├── requests/              # Skill swap requests
│   ├── notifications/         # Notification system
│   ├── manage.py              # Django management script
│   ├── requirements.txt       # Python dependencies
│   └── seed_database.py       # Database seeding script
├── frontend/                   # Simple HTML/JS frontend
│   ├── index.html            # Main HTML file
│   └── js/                   # JavaScript files
│       ├── api-client.js      # API communication
│       ├── components.js      # React components
│       └── app.js            # Main app logic
└── README.md                  # This file
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register a new user |
| POST | /api/auth/login | Login and get JWT token |
| GET | /api/auth/me | Get current user profile |
| GET | /api/users | List/search users |
| PUT | /api/users/me/profile | Update profile |
| POST | /api/users/me/skills/offered | Add a skill offered |
| DELETE | /api/users/me/skills/offered | Remove a skill offered |
| POST | /api/users/me/skills/wanted | Add a skill wanted |
| DELETE | /api/users/me/skills/wanted | Remove a skill wanted |
| GET | /api/requests | List swap requests |
| POST | /api/requests | Create a swap request |
| PUT | /api/requests/:id/accept | Accept a request |
| PUT | /api/requests/:id/reject | Reject a request |
| PUT | /api/requests/:id/complete | Mark as completed |
| DELETE | /api/requests/:id | Delete a request |
| GET | /api/notifications | List notifications |
| PUT | /api/notifications/:id/read | Mark notification as read |
| PUT | /api/notifications/read-all | Mark all as read |
| GET | /api/admin/stats | Platform stats (admin only) |
| GET | /api/admin/users | All users (admin only) |
| PUT | /api/admin/users/:id/block | Block a user (admin only) |
| PUT | /api/admin/users/:id/unblock | Unblock a user (admin only) |
| DELETE | /api/admin/users/:id | Delete a user (admin only) |

---

## Key Differences from Original

This simplified version uses:

1. **Python Django** instead of Node.js/Express
2. **SQLite** instead of PostgreSQL (easier setup)
3. **Plain JavaScript** instead of TypeScript
4. **React via CDN** instead of complex build tools
5. **Simplified API client** without code generation
6. **Same UI/UX** and all original features

---

## Troubleshooting

**Port already in use**: Change the port in the `runserver` command: `python manage.py runserver 8080`

**Database connection failed**: Make sure you ran the migrations: `python manage.py migrate`

**No data showing**: Run the seeder script: `python seed_database.py`

**Login fails**: Use the admin accounts or sample users created by the seeder script

**CORS errors**: Make sure the Django server is running and the frontend is accessing the correct API URL

---

## Development Notes

- The backend uses Django with Django REST Framework
- Authentication is handled via JWT tokens stored in localStorage
- The frontend uses React loaded from CDN for simplicity
- No build process required - just open the HTML file
- Database is SQLite for easy development and deployment
