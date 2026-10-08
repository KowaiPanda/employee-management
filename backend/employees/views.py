from django.contrib.auth import authenticate
from django_filters import rest_framework as filters
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Department, Employee
from .serializers import DepartmentSerializer, EmployeeSerializer


class EmployeeFilter(filters.FilterSet):
    # ?department=IT matches by department name (case-insensitive)
    department = filters.CharFilter(field_name="department__name", lookup_expr="iexact")

    class Meta:
        model = Employee
        fields = ["department", "status"]


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("department")
    serializer_class = EmployeeSerializer
    filterset_class = EmployeeFilter
    search_fields = ["name", "email", "phone", "designation"]
    ordering_fields = ["id", "name", "email", "joining_date", "status"]


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    pagination_class = None
    http_method_names = ["get", "post", "put", "delete"]

    def destroy(self, request, *args, **kwargs):
        if self.get_object().employees.exists():
            return Response(
                {"detail": "Cannot delete a department that has employees."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    user = authenticate(
        username=request.data.get("username"),
        password=request.data.get("password"),
    )
    if not user:
        return Response(
            {"detail": "Invalid username or password."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    token, _ = Token.objects.get_or_create(user=user)
    return Response(
        {"token": token.key, "username": user.username, "is_admin": user.is_staff}
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    request.auth.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
