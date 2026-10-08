# Employee Management API

Django REST API for managing employees and departments, backed by PostgreSQL.

**Stack:** Django 5.2, Django REST Framework, django-filter, PostgreSQL (psycopg 3), DRF token authentication.

## Project setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate             # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

## Environment setup

Copy `.env.example` to `.env` and fill in your values:

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | dev key | Django secret key |
| `DEBUG` | `True` | Debug mode |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated hosts |
| `DB_NAME` | `employee_db` | PostgreSQL database |
| `DB_USER` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | (empty) | PostgreSQL password |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |

## Database setup

```bash
psql -U postgres -c "CREATE DATABASE employee_db;"
python manage.py migrate
python manage.py seed               # optional demo data
```

`seed` creates two users (`admin` / `admin123` and `user` / `user123`), 4 departments and 12 employees. To make your own admin instead, run `python manage.py createsuperuser`.

## Running the server

```bash
python manage.py runserver          # http://localhost:8000
```

- API: `http://localhost:8000/api/`
- Django admin: `http://localhost:8000/admin/` (log in as a staff user)

## Running tests

```bash
python manage.py test employees
```

The tests cover creating, getting, listing, updating and deleting employees, invalid data, unauthorized requests, read-only normal users, login, filtering/search/ordering, and department CRUD.

## Models

```
Department 1 ──── * Employee   (Employee.department is a ForeignKey, on_delete=PROTECT)
```

**Department:** `id`, `name` (unique), `description`

**Employee:** `id`, `name`, `email` (unique), `phone`, `department`, `designation`, `joining_date`, `status` (`active` | `inactive`), `created_at`, `updated_at`

### Validation

| Field | Rule |
|---|---|
| `name` | Required, not blank |
| `email` | Required, valid email, unique |
| `phone` | 10-14 digits, optional leading `+` |
| `department` | Required, must be an existing department id |
| `designation` | Required |
| `joining_date` | Required, valid `YYYY-MM-DD`, not in the future |
| `status` | `active` or `inactive` |

A department that still has employees cannot be deleted (returns `400`).

## Authentication

The API uses DRF token authentication.

1. `POST /api/auth/login/` with a username and password returns a token.
2. Send the token on every request: `Authorization: Token <token>`.
3. `POST /api/auth/logout/` deletes the token.

### Permissions

| Role | Read (GET) | Create / Update / Delete |
|---|---|---|
| Not logged in | ✗ `401` | ✗ `401` |
| Normal user | ✓ | ✗ `403` |
| Admin (`is_staff`) | ✓ | ✓ |

These rules live in `employees/permissions.py` (`IsAdminOrReadOnly`) and apply to every endpoint by default.

## API endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/login/` | Get a token | Public |
| POST | `/api/auth/logout/` | Delete the token | Logged in |
| GET | `/api/employees/` | List employees (paginated) | Logged in |
| GET | `/api/employees/{id}/` | Get one employee | Logged in |
| POST | `/api/employees/` | Create employee | Admin |
| PUT | `/api/employees/{id}/` | Replace employee | Admin |
| PATCH | `/api/employees/{id}/` | Partially update employee | Admin |
| DELETE | `/api/employees/{id}/` | Delete employee | Admin |
| GET | `/api/departments/` | List departments | Logged in |
| POST | `/api/departments/` | Create department | Admin |
| PUT | `/api/departments/{id}/` | Update department | Admin |
| DELETE | `/api/departments/{id}/` | Delete department | Admin |

### Query parameters for `GET /api/employees/`

| Param | Example | Description |
|---|---|---|
| `department` | `?department=IT` | Filter by department name (case-insensitive) |
| `status` | `?status=active` | Filter by status |
| `search` | `?search=john` | Search name, email, phone, designation |
| `ordering` | `?ordering=name`, `?ordering=-joining_date` | Sort by `id`, `name`, `email`, `joining_date`, `status` (`-` for descending) |
| `page` | `?page=2` | Page number (10 per page) |

Parameters can be combined: `/api/employees/?department=IT&status=active&search=dev&ordering=-joining_date`

## Example requests and responses

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

```json
{ "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b", "username": "admin", "is_admin": true }
```

Bad credentials return `400`: `{ "detail": "Invalid username or password." }`

### List employees

```bash
curl "http://localhost:8000/api/employees/?search=john" \
  -H "Authorization: Token <token>"
```

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "9876543210",
      "department": 1,
      "department_name": "IT",
      "designation": "Developer",
      "joining_date": "2023-01-10",
      "status": "active",
      "created_at": "2026-10-08T09:34:42.587178Z",
      "updated_at": "2026-10-08T09:34:42.587178Z"
    }
  ]
}
```

### Create employee

```bash
curl -X POST http://localhost:8000/api/employees/ \
  -H "Authorization: Token <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Asha Menon", "email": "asha@example.com", "phone": "9876500001",
       "department": 1, "designation": "Developer", "joining_date": "2024-06-01", "status": "active"}'
```

`201 Created` returns the new employee in the same shape as a list item.

### Partial update

```bash
curl -X PATCH http://localhost:8000/api/employees/1/ \
  -H "Authorization: Token <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

`200 OK` returns the updated employee.

### Delete employee

```bash
curl -X DELETE http://localhost:8000/api/employees/1/ -H "Authorization: Token <token>"
```

`204 No Content`

### Invalid data (`400 Bad Request`)

```json
{
  "name": ["This field may not be blank."],
  "email": ["Enter a valid email address."],
  "phone": ["Phone must be 10-14 digits."],
  "department": ["This field is required."],
  "joining_date": ["Joining date cannot be in the future."],
  "status": ["\"unknown\" is not a valid choice."]
}
```

### No token (`401 Unauthorized`)

```json
{ "detail": "Authentication credentials were not provided." }
```

### Normal user writing (`403 Forbidden`)

```json
{ "detail": "You do not have permission to perform this action." }
```

### List departments

```json
[
  { "id": 3, "name": "Finance", "description": "Accounts and payroll" },
  { "id": 2, "name": "HR", "description": "People and hiring" },
  { "id": 1, "name": "IT", "description": "Software and infrastructure" },
  { "id": 4, "name": "Sales", "description": "Customer acquisition" }
]
```

## Postman collection

Import `postman_collection.json` into Postman. Run **Auth → Login (admin)** first: it saves the token into the `{{token}}` collection variable, and every other request uses it automatically. "Create employee" saves the new id as `{{employeeId}}`, so you can run Get, Update and Delete next.

The collection runs from top to bottom (Postman Runner, or `npx newman run postman_collection.json`). It ends with a **Permissions** folder that logs in as the normal user and checks that writes return `403`.

## Django admin

`/admin/` provides:

- **Employees:** list of id, name, email, department, designation, joining date and status; search by name, email, phone and designation; filters for department, status and joining date; date drill-down; status editable directly in the list.
- **Departments:** list with search by name.
