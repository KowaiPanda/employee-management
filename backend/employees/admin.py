from django.contrib import admin

from .models import Department, Employee


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "description"]
    search_fields = ["name"]


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "email", "department", "designation", "joining_date", "status"]
    list_filter = ["department", "status", "joining_date"]
    list_editable = ["status"]
    search_fields = ["name", "email", "phone", "designation"]
    list_select_related = ["department"]
    date_hierarchy = "joining_date"
    readonly_fields = ["created_at", "updated_at"]
