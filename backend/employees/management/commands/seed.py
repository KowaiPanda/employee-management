from datetime import date

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from employees.models import Department, Employee

DEPARTMENTS = [
    ("IT", "Software and infrastructure"),
    ("HR", "People and hiring"),
    ("Finance", "Accounts and payroll"),
    ("Sales", "Customer acquisition"),
]

EMPLOYEES = [
    ("John Smith", "john@example.com", "9876543210", "IT", "Developer", date(2023, 1, 10), "active"),
    ("Priya Sharma", "priya@example.com", "9876543211", "HR", "HR Manager", date(2022, 6, 1), "active"),
    ("Arun Kumar", "arun@example.com", "9876543212", "Finance", "Accountant", date(2021, 3, 15), "inactive"),
    ("Meera Nair", "meera@example.com", "9876543213", "IT", "QA Engineer", date(2024, 2, 20), "active"),
    ("David Lee", "david@example.com", "9876543214", "Sales", "Sales Executive", date(2023, 9, 5), "active"),
    ("Sara Khan", "sara@example.com", "9876543215", "Sales", "Sales Manager", date(2020, 11, 30), "inactive"),
    ("Ravi Patel", "ravi@example.com", "9876543216", "IT", "DevOps Engineer", date(2022, 8, 18), "active"),
    ("Anita Das", "anita@example.com", "9876543217", "Finance", "Analyst", date(2024, 5, 2), "active"),
    ("Karthik Raj", "karthik@example.com", "9876543218", "HR", "Recruiter", date(2023, 4, 12), "active"),
    ("Neha Gupta", "neha@example.com", "9876543219", "IT", "Team Lead", date(2019, 7, 25), "active"),
    ("Vikram Singh", "vikram@example.com", "9876543220", "Sales", "Sales Executive", date(2024, 1, 8), "inactive"),
    ("Lakshmi Iyer", "lakshmi@example.com", "9876543221", "IT", "Developer", date(2025, 3, 3), "active"),
]


class Command(BaseCommand):
    help = "Create demo users, departments and employees"

    def handle(self, *args, **options):
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@example.com", "admin123")
        if not User.objects.filter(username="user").exists():
            User.objects.create_user("user", "user@example.com", "user123")

        depts = {}
        for name, desc in DEPARTMENTS:
            depts[name], _ = Department.objects.get_or_create(
                name=name, defaults={"description": desc}
            )

        for name, email, phone, dept, role, joined, status in EMPLOYEES:
            Employee.objects.get_or_create(
                email=email,
                defaults={
                    "name": name,
                    "phone": phone,
                    "department": depts[dept],
                    "designation": role,
                    "joining_date": joined,
                    "status": status,
                },
            )

        self.stdout.write(self.style.SUCCESS("Seed data created."))
