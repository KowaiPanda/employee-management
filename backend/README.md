# Employee Management API

Django REST API for managing employees and departments, backed by PostgreSQL.

**Stack:** Django 5.2, Django REST Framework, django-filter, PostgreSQL , DRF token authentication.

## Project setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate             # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

## Environment setup

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
| Not logged in |  `401` |  `401` |
| Normal user | `200` |  `403` |
| Admin (`is_staff`) | `200` | `2xx` |

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

## Postman collection

Import `postman_collection.json` into Postman. Run **Auth → Login (admin)** first: it saves the token into the `{{token}}` collection variable, and every other request uses it automatically. "Create employee" saves the new id as `{{employeeId}}`, so you can run Get, Update and Delete next.

The collection runs from top to bottom (Postman Runner, or `npx newman run postman_collection.json`). It ends with a **Permissions** folder that logs in as the normal user and checks that writes return `403`.

## Django admin

`/admin/` provides:

- **Employees:** list of id, name, email, department, designation, joining date and status; search by name, email, phone and designation; filters for department, status and joining date; date drill-down; status editable directly in the list.
- **Departments:** list with search by name.