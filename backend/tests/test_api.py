import os
from pathlib import Path


TEST_DB = Path(__file__).with_name("test_portal.db")
if TEST_DB.exists():
    TEST_DB.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB}"
os.environ["SECRET_KEY"] = "test-secret-only"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


def login(client: TestClient, username: str, password: str) -> str:
    response = client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_acceptance_flow():
    with TestClient(app) as client:
        admin_token = login(client, "admin", "admin123")
        student_token = login(client, "alumno01", "alumno123")

        assert client.get("/api/me").status_code == 401

        student_me = client.get("/api/student/me", headers=auth(student_token))
        assert student_me.status_code == 200
        student = student_me.json()
        assert student["account_number"] == "2213021117"

        all_records = client.get("/api/student/me/records", headers=auth(student_token))
        assert all_records.status_code == 200
        assert len(all_records.json()) >= 6

        filtered = client.get("/api/student/me/records?term=26O", headers=auth(student_token))
        assert filtered.status_code == 200
        assert filtered.json()
        assert all(item["term_code"] == "26O" for item in filtered.json())

        students = client.get("/api/admin/students", headers=auth(admin_token))
        assert students.status_code == 200
        student_id = students.json()[0]["id"]

        forbidden = client.post(
            f"/api/admin/students/{student_id}/records",
            headers=auth(student_token),
            json={
                "subject_id": 1,
                "term_id": 1,
                "evaluation_type": "GLO.",
                "grade": "MB",
                "acta_number": "DENEGADO",
                "credits": 28,
                "status": "REGISTRADO",
            },
        )
        assert forbidden.status_code == 403

        subjects = client.get("/api/admin/subjects", headers=auth(admin_token)).json()
        terms = client.get("/api/admin/terms", headers=auth(admin_token)).json()
        created = client.post(
            f"/api/admin/students/{student_id}/records",
            headers=auth(admin_token),
            json={
                "subject_id": subjects[0]["id"],
                "term_id": terms[-1]["id"],
                "evaluation_type": "REC.",
                "grade": "S",
                "acta_number": "ACEPTACION-001",
                "credits": subjects[0]["creditos"],
                "status": "REGISTRADO",
            },
        )
        assert created.status_code == 201, created.text
        record_id = created.json()["id"]

        visible = client.get("/api/student/me/records?term=26O", headers=auth(student_token))
        assert any(item["acta_number"] == "ACEPTACION-001" for item in visible.json())

        updated = client.put(
            f"/api/admin/records/{record_id}",
            headers=auth(admin_token),
            json={"grade": "MB", "acta_number": "ACEPTACION-002"},
        )
        assert updated.status_code == 200
        assert updated.json()["grade"] == "MB"

        visible_after_update = client.get("/api/student/me/records", headers=auth(student_token)).json()
        assert any(
            item["id"] == record_id and item["grade"] == "MB" and item["acta_number"] == "ACEPTACION-002"
            for item in visible_after_update
        )

        deleted = client.delete(f"/api/admin/records/{record_id}", headers=auth(admin_token))
        assert deleted.status_code == 204
        visible_after_delete = client.get("/api/student/me/records", headers=auth(student_token)).json()
        assert not any(item["id"] == record_id for item in visible_after_delete)


def teardown_module():
    if TEST_DB.exists():
        TEST_DB.unlink()
