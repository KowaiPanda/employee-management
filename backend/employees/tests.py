from datetime import date, timedelta

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Department, Employee


class EmployeeAPITests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user("admin", password="pass", is_staff=True)
        self.user = User.objects.create_user("user", password="pass")
        self.it = Department.objects.create(name="IT")
        self.hr = Department.objects.create(name="HR")
        self.emp = Employee.objects.create(
            name="John Smith",
            email="john@example.com",
            phone="9876543210",
            department=self.it,
            designation="Developer",
            joining_date=date(2023, 1, 10),
        )
        self.data = {
            "name": "Priya Sharma",
            "email": "priya@example.com",
            "phone": "9876543211",
            "department": self.hr.id,
            "designation": "HR Manager",
            "joining_date": "2022-06-01",
            "status": "active",
        }
        self.client.force_authenticate(self.admin)

    def url(self, pk=None):
        return f"/api/employees/{pk}/" if pk else "/api/employees/"

    def test_create_employee(self):
        res = self.client.post(self.url(), self.data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["department_name"], "HR")
        self.assertEqual(Employee.objects.count(), 2)

    def test_get_employee(self):
        res = self.client.get(self.url(self.emp.id))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["email"], "john@example.com")

    def test_list_employees(self):
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 1)
        self.assertIn("results", res.data)

    def test_filter_search_ordering(self):
        self.client.post(self.url(), self.data)
        res = self.client.get(self.url(), {"department": "it"})
        self.assertEqual([e["name"] for e in res.data["results"]], ["John Smith"])
        res = self.client.get(self.url(), {"search": "priya"})
        self.assertEqual(res.data["count"], 1)
        res = self.client.get(self.url(), {"ordering": "-name"})
        self.assertEqual(res.data["results"][0]["name"], "Priya Sharma")

    def test_update_employee(self):
        res = self.client.put(self.url(self.emp.id), {**self.data, "email": "new@example.com"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        res = self.client.patch(self.url(self.emp.id), {"status": "inactive"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.emp.refresh_from_db()
        self.assertEqual(self.emp.email, "new@example.com")
        self.assertEqual(self.emp.status, "inactive")

    def test_delete_employee(self):
        res = self.client.delete(self.url(self.emp.id))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Employee.objects.exists())

    def test_invalid_employee_data(self):
        bad = {
            **self.data,
            "name": "",
            "email": "not-an-email",
            "status": "unknown",
            "joining_date": str(date.today() + timedelta(days=5)),
        }
        bad.pop("department")
        res = self.client.post(self.url(), bad)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        for field in ["name", "email", "status", "joining_date", "department"]:
            self.assertIn(field, res.data)

    def test_unauthorized_request(self):
        self.client.force_authenticate(None)
        res = self.client.get(self.url())
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_normal_user_is_read_only(self):
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get(self.url()).status_code, status.HTTP_200_OK)
        res = self.client.post(self.url(), self.data)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_returns_token(self):
        self.client.force_authenticate(None)
        res = self.client.post("/api/auth/login/", {"username": "admin", "password": "pass"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["is_admin"])
        res = self.client.post("/api/auth/login/", {"username": "admin", "password": "wrong"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class DepartmentAPITests(APITestCase):
    def setUp(self):
        admin = User.objects.create_user("admin", password="pass", is_staff=True)
        self.client.force_authenticate(admin)

    def test_department_crud(self):
        res = self.client.post("/api/departments/", {"name": "IT", "description": "Tech"})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        pk = res.data["id"]
        res = self.client.put(f"/api/departments/{pk}/", {"name": "Tech", "description": ""})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(self.client.get("/api/departments/").data), 1)
        res = self.client.delete(f"/api/departments/{pk}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_cannot_delete_department_with_employees(self):
        dept = Department.objects.create(name="IT")
        Employee.objects.create(
            name="A", email="a@example.com", phone="9876543210", department=dept,
            designation="Dev", joining_date=date(2023, 1, 1),
        )
        res = self.client.delete(f"/api/departments/{dept.id}/")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
