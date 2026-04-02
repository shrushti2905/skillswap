
SKILLSWAP PROJECT — RUN INSTRUCTIONS

1. Open terminal

cd backend

2. Create virtual environment

python -m venv venv

3. Activate environment

Windows:
venv\Scripts\activate

4. Install dependencies

pip install -r requirements.txt

5. Run migrations

python manage.py migrate

6. Start server

python manage.py runserver

Frontend:

Open index.html in browser
OR

cd frontend
python -m http.server 5500

Then open:

http://localhost:5500
