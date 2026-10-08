"""Exercise the running app through Vite; remove only records created by this run."""

import json
import os
import uuid
from datetime import date, timedelta
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


BASE = os.environ.get("APP_URL", "http://127.0.0.1:5173").rstrip("/")
passed = []


def call(method, path, body=None, token=None, expected=200):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Token {token}"
    req = Request(BASE + path, data=json.dumps(body).encode() if body is not None else None,
                  headers=headers, method=method)
    try:
        response = urlopen(req, timeout=10)
    except HTTPError as error:
        response = error
    with response:
        raw = response.read().decode()
        actual = response.status if hasattr(response, "status") else response.code
    assert actual == expected, f"{method} {path}: expected {expected}, got {actual}: {raw[:300]}"
    return json.loads(raw) if raw else None


def check(label, condition=True):
    assert condition, label
    passed.append(label)
    print(f"PASS: {label}")


def listing(token, **params):
    return call("GET", "/api/employees/?" + urlencode(params), token=token)


def main():
    admin = user = None
    employee_id = department_id = None
    try:
        for route in ["/", "/login", "/employees", "/employees/new", "/employees/1",
                      "/employees/1/edit", "/unknown-route"]:
            with urlopen(BASE + route, timeout=10) as response:
                html = response.read().decode()
                check(f"SPA entrypoint served at {route}", response.status == 200 and 'id="root"' in html)

        for endpoint in ["/api/employees/", "/api/departments/", "/api/auth/logout/"]:
            call("POST" if endpoint.endswith("logout/") else "GET", endpoint, expected=401)
            check(f"Anonymous access denied: {endpoint}")
        call("GET", "/api/employees/", token="invalid-token", expected=401)
        check("Invalid token rejected")
        call("POST", "/api/auth/login/", {"username": "admin", "password": "incorrect"}, expected=400)
        call("POST", "/api/auth/login/", {}, expected=400)
        check("Invalid and missing login credentials rejected")

        login = call("POST", "/api/auth/login/", {"username": "admin", "password": "admin123"})
        admin = login["token"]
        check("Admin demo login", login["is_admin"] is True)
        login = call("POST", "/api/auth/login/", {"username": "user", "password": "user123"})
        user = login["token"]
        check("Read-only demo login", login["is_admin"] is False)

        baseline = listing(admin)
        departments = call("GET", "/api/departments/", token=admin)
        check("Seeded employees and departments available", baseline["count"] >= 12 and len(departments) >= 4)
        check("Department response is an unpaginated array", isinstance(departments, list))
        check("Employee page size is 10", len(baseline["results"]) == 10)
        second = listing(admin, page=2)
        check("Pagination next/previous and distinct rows",
              baseline["next"] is not None and second["previous"] is not None
              and not ({e["id"] for e in baseline["results"]} & {e["id"] for e in second["results"]}))
        active, inactive = listing(admin, status="active"), listing(admin, status="inactive")
        check("Dashboard counts reconcile", active["count"] + inactive["count"] == baseline["count"])
        check("Status filtering", all(e["status"] == "active" for e in active["results"])
              and all(e["status"] == "inactive" for e in inactive["results"]))
        filtered = listing(admin, department="it")
        check("Case-insensitive department filter", filtered["count"] > 0
              and all(e["department_name"] == "IT" for e in filtered["results"]))
        combined = listing(admin, department="IT", status="active", search="Developer")
        check("Combined filters and designation search", combined["count"] > 0
              and all(e["department_name"] == "IT" and e["status"] == "active"
                      and "developer" in e["designation"].lower() for e in combined["results"]))
        sample = baseline["results"][0]
        for field in ["name", "email", "phone", "designation"]:
            matches = listing(admin, search=sample[field])
            check(f"Search matches {field}", matches["count"] > 0)
        ordered = listing(admin, ordering="-name")["results"]
        check("Descending name ordering", [e["name"] for e in ordered] == sorted([e["name"] for e in ordered], reverse=True))
        check("Empty search result", listing(admin, search=str(uuid.uuid4()))["count"] == 0)
        call("GET", "/api/employees/?page=999999", token=admin, expected=404)
        call("GET", "/api/employees/999999999/", token=admin, expected=404)
        check("Missing employee and invalid page return 404")
        details = call("GET", f"/api/employees/{sample['id']}/", token=user)
        check("Read-only employee details include timestamps", "created_at" in details and "updated_at" in details)

        marker = uuid.uuid4().hex[:10]
        department = call("POST", "/api/departments/", {"name": f"QA {marker}", "description": "Temporary readiness test"},
                          token=admin, expected=201)
        department_id = department["id"]
        check("Department creation")
        dept_path = f"/api/departments/{department_id}/"
        updated_dept = call("PUT", dept_path, {"name": f"QA Updated {marker}", "description": "Updated"}, token=admin)
        check("Department update and detail", call("GET", dept_path, token=admin) == updated_dept)
        data = {"name": "QA Test Employee", "email": f"qa-{marker}@example.com", "phone": "+919876543210",
                "department": department_id, "designation": "QA Analyst", "joining_date": "2024-01-15", "status": "active"}
        for field, value in [("name", " "), ("email", "bad-email"), ("phone", "123"), ("department", 999999999),
                             ("designation", ""), ("joining_date", str(date.today() + timedelta(days=2))), ("status", "unknown")]:
            errors = call("POST", "/api/employees/", {**data, field: value}, token=admin, expected=400)
            check(f"Backend validation: {field}", field in errors)
        errors = call("POST", "/api/employees/", {**data, "email": sample["email"]}, token=admin, expected=400)
        check("Duplicate employee email rejected", "email" in errors)
        created = call("POST", "/api/employees/", data, token=admin, expected=201)
        employee_id = created["id"]
        emp_path = f"/api/employees/{employee_id}/"
        check("Employee creation with department name", created["department_name"] == updated_dept["name"])
        call("DELETE", dept_path, token=admin, expected=400)
        check("Department deletion blocked while employees reference it")
        for endpoint, body in [(emp_path, data), (dept_path, {"name": "Denied"})]:
            for method in ["PUT", "DELETE"]:
                call(method, endpoint, body if method == "PUT" else None, token=user, expected=403)
                check(f"Read-only user cannot {method} {endpoint.split('/')[2]}")
        for endpoint, body in [("/api/employees/", data), ("/api/departments/", {"name": "Denied"})]:
            call("POST", endpoint, body, token=user, expected=403)
            check(f"Read-only user cannot create {endpoint.split('/')[2]}")
        call("PATCH", emp_path, {"status": "inactive"}, token=user, expected=403)
        check("Read-only user cannot PATCH employees")
        updated = call("PUT", emp_path, {**data, "name": "QA Updated Employee"}, token=admin)
        check("Employee full update", updated["name"] == "QA Updated Employee")
        patched = call("PATCH", emp_path, {"status": "inactive"}, token=admin)
        check("Employee partial update", patched["status"] == "inactive" and patched["name"] == updated["name"])
        check("Employee update persisted", call("GET", emp_path, token=admin)["status"] == "inactive")
        call("DELETE", emp_path, token=admin, expected=204)
        employee_id = None
        call("GET", emp_path, token=admin, expected=404)
        check("Employee deletion persisted")
        call("DELETE", dept_path, token=admin, expected=204)
        department_id = None
        check("Empty department deletion")
        check("Original database counts preserved", listing(admin)["count"] == baseline["count"]
              and len(call("GET", "/api/departments/", token=admin)) == len(departments))
        for label, token in [("read-only", user), ("admin", admin)]:
            call("POST", "/api/auth/logout/", token=token, expected=204)
            call("GET", "/api/employees/", token=token, expected=401)
            check(f"{label} logout invalidates token")
        user = admin = None
        print(json.dumps({"passed": len(passed), "base_url": BASE, "employees": baseline["count"],
                          "active": active["count"], "inactive": inactive["count"], "departments": len(departments)}))
    finally:
        if admin and (employee_id or department_id):
            if employee_id:
                call("DELETE", f"/api/employees/{employee_id}/", token=admin, expected=204)
            if department_id:
                call("DELETE", f"/api/departments/{department_id}/", token=admin, expected=204)
        for token in [user, admin]:
            if token:
                try:
                    call("POST", "/api/auth/logout/", token=token, expected=204)
                except AssertionError:
                    pass


if __name__ == "__main__":
    main()
