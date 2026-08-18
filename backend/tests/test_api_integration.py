import os
import uuid

import httpx


API_BASE_URL = os.getenv("API_BASE_URL", "http://api:8000")


def auth_headers(access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token}"}


def test_complete_beneficiary_flow() -> None:
    email = f"beneficiary-{uuid.uuid4()}@example.com"
    with httpx.Client(base_url=API_BASE_URL, timeout=20, trust_env=False) as client:
        assert client.get("/health").json()["status"] == "ok"

        invalid_login = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "wrong"},
        )
        assert invalid_login.status_code == 401
        assert invalid_login.json()["code"] == "invalid_credentials"

        registration = client.post(
            "/api/v1/auth/register",
            json={
                "name": "مستخدمة اختبار",
                "birthDate": "2000-01-15",
                "stage": "الثانوية",
                "address": "أسيوط",
                "phone": "01000000000",
                "whatsapp": "01000000000",
                "school": "مدرسة الاختبار",
                "classSaintName": "القديس أثناسيوس الرسولي",
                "confessionFather": None,
                "talents": ["الترانيم"],
                "email": email,
                "password": "Password1",
                "confirmPassword": "Password1",
            },
        )
        assert registration.status_code == 201, registration.text
        verification_code = registration.json()["verificationCode"]

        verification = client.post(
            "/api/v1/auth/verification/verify",
            json={
                "email": email,
                "code": verification_code,
                "mode": "registration",
            },
        )
        assert verification.status_code == 200, verification.text
        session = verification.json()["session"]
        headers = auth_headers(session["accessToken"])

        profile = client.get("/api/v1/profile", headers=headers)
        assert profile.status_code == 200
        assert profile.json()["email"] == email
        assert profile.json()["points"] == 0

        home = client.get("/api/v1/home", headers=headers)
        assert home.status_code == 200
        assert home.json()["questionCategories"]

        retreat = client.post(
            "/api/v1/retreat/submissions",
            headers=headers,
            json={"activityIds": ["daily-reading"], "reflection": "تأمل الاختبار"},
        )
        assert retreat.status_code == 201, retreat.text
        assert retreat.json()["pointsAwarded"] == 50

        duplicate_retreat = client.post(
            "/api/v1/retreat/submissions",
            headers=headers,
            json={"activityIds": ["daily-reading"], "reflection": "تحديث"},
        )
        assert duplicate_retreat.status_code == 201
        assert duplicate_retreat.json()["pointsAwarded"] == 0

        know_me = client.get("/api/v1/questions/know-me", headers=headers).json()
        today_question = next(item for item in know_me if item["isToday"])
        answer = client.post(
            f"/api/v1/questions/know-me/{today_question['id']}/answers",
            headers=headers,
            json={"answer": "إجابة الاختبار"},
        )
        assert answer.status_code == 201, answer.text
        assert answer.json()["pointsAwarded"] == 50

        reflection = client.get(
            "/api/v1/retreat/reflection/latest", headers=headers
        ).json()
        reflection_completion = client.post(
            f"/api/v1/retreat/reflection/{reflection['id']}/complete",
            headers=headers,
        )
        assert reflection_completion.status_code == 201
        assert reflection_completion.json()["pointsAwarded"] == 50

        proposed_question = client.post(
            "/api/v1/questions/proposals",
            headers=headers,
            json={"question": "ما هو سؤال الاختبار؟"},
        )
        assert proposed_question.status_code == 201
        assert proposed_question.json()["status"] == "pending"

        suggestion = client.post(
            "/api/v1/suggestions",
            headers=headers,
            json={
                "generalSuggestion": "اقتراح الاختبار",
                "lessonSuggestion": "",
                "hymnSuggestion": "",
                "hymnRating": 4,
                "anonymous": True,
            },
        )
        assert suggestion.status_code == 201

        house = client.get("/api/v1/conversations/all", headers=headers)
        assert house.status_code == 200, house.text
        sent_message = client.post(
            "/api/v1/conversations/messages",
            headers=headers,
            json={
                "conversationId": "all",
                "content": "رسالة الاختبار",
                "kind": "text",
                "anonymous": True,
            },
        )
        assert sent_message.status_code == 201, sent_message.text
        assert sent_message.json()["message"]["senderName"] == "مجهول الهوية"

        updated_profile = client.get("/api/v1/profile", headers=headers).json()
        assert updated_profile["points"] == 150

        password_change = client.post(
            "/api/v1/auth/password/change",
            headers=headers,
            json={
                "currentPassword": "Password1",
                "password": "Password2",
                "confirmPassword": "Password2",
            },
        )
        assert password_change.status_code == 200
        relogin = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "Password2"},
        )
        assert relogin.status_code == 200

        assert client.get("/openapi.json").status_code == 200
        assert client.get("/docs").status_code == 200
