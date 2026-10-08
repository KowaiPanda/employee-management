# Employee Management

A full-stack employee management app:

- **frontend/**: React + Vite + Tailwind CSS dashboard ([frontend/README.md](frontend/README.md))
- **backend/**: Django REST API with PostgreSQL ([backend/README.md](backend/README.md))

```
employee-management/
├── backend/                  Django project (REST API, admin, tests)
│   ├── config/               settings, root URLs
│   ├── employees/            models, serializers, views, permissions, admin, tests
│   ├── postman_collection.json
│   └── README.md             API documentation
└── frontend/                 React app
    ├── src/
    └── README.md             structure, components, API integration
```

## Quick start

Prerequisites: Python 3.11+, Node.js 20+, PostgreSQL 14+.

```bash
# 1. Database
psql -U postgres -c "CREATE DATABASE employee_db;"

# 2. Backend (http://localhost:8000)
cd backend
python -m venv venv
venv\Scripts\activate            # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env           # macOS/Linux: cp .env.example .env  (then set DB_PASSWORD)
python manage.py migrate
python manage.py seed            # demo users, departments, employees
python manage.py runserver

# 3. Frontend (http://localhost:5173), in a second terminal
cd frontend
npm install
npm run dev
```

Demo logins (created by `seed`):

| Username | Password | Role | Access |
|---|---|---|---|
| `admin` | `admin123` | Admin | Create, read, update, delete |
| `user` | `user123` | Normal user | Read only |