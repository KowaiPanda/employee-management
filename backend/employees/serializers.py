import re
from datetime import date

from rest_framework import serializers

from .models import Department, Employee


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name", "description"]


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Employee
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "department",
            "department_name",
            "designation",
            "joining_date",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value.strip()

    def validate_phone(self, value):
        if not re.fullmatch(r"\+?\d{10,14}", value):
            raise serializers.ValidationError("Phone must be 10-14 digits.")
        return value

    def validate_joining_date(self, value):
        if value > date.today():
            raise serializers.ValidationError("Joining date cannot be in the future.")
        return value
