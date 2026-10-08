from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from employees import views

router = DefaultRouter()
router.register("employees", views.EmployeeViewSet)
router.register("departments", views.DepartmentViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/login/", views.login),
    path("api/auth/logout/", views.logout),
    path("api/", include(router.urls)),
]
