import os
import uuid

import httpx

from tests.helpers import verification_code_from_email


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
        verification_code = verification_code_from_email(
            registration.json(), email
        )

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

        english_headers = {**headers, "Accept-Language": "en"}
        english_home = client.get("/api/v1/home", headers=english_headers)
        assert english_home.status_code == 200
        english_categories = english_home.json()["questionCategories"]
        assert next(
            category for category in english_categories if category["id"] == "prayer"
        )["title"] == "Prayer"
        assert english_home.json()["upcomingEvents"][0]["name"] == "Sports Day"

        english_activities = client.get(
            "/api/v1/retreat/activities", headers=english_headers
        )
        assert english_activities.status_code == 200
        assert english_activities.json()[0]["title"] == "Daily reading"

        english_questions = client.get(
            "/api/v1/questions",
            headers=english_headers,
            params={"categoryId": "prayer"},
        )
        assert english_questions.status_code == 200
        assert english_questions.json()[0]["question"] == "Why do we pray?"

        english_house = client.get(
            "/api/v1/conversations/all", headers=english_headers
        )
        assert english_house.status_code == 200
        assert english_house.json()["servantName"] == "Sunday School servants"

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
        assert sent_message.json()["message"]["isAnonymous"] is True

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

        forgot = client.post(
            "/api/v1/auth/password/forgot",
            headers={"Accept-Language": "en"},
            json={"email": email},
        )
        assert forgot.status_code == 200, forgot.text
        reset_code = verification_code_from_email(forgot.json(), email)

        invalid_code = client.post(
            "/api/v1/auth/verification/verify",
            json={
                "email": email,
                "code": "000000" if reset_code != "000000" else "999999",
                "mode": "passwordReset",
            },
        )
        assert invalid_code.status_code == 400
        assert invalid_code.json()["code"] == "verification_invalid"

        verified_reset = client.post(
            "/api/v1/auth/verification/verify",
            json={
                "email": email,
                "code": reset_code,
                "mode": "passwordReset",
            },
        )
        assert verified_reset.status_code == 200, verified_reset.text
        reset_token = verified_reset.json()["passwordResetToken"]

        reset = client.post(
            "/api/v1/auth/password/reset",
            headers={"Accept-Language": "en"},
            json={
                "email": email,
                "resetToken": reset_token,
                "password": "Password3",
                "confirmPassword": "Password3",
            },
        )
        assert reset.status_code == 200, reset.text
        assert reset.json()["message"] == "Password updated successfully."

        reused_token = client.post(
            "/api/v1/auth/password/reset",
            json={
                "email": email,
                "resetToken": reset_token,
                "password": "Password4",
                "confirmPassword": "Password4",
            },
        )
        assert reused_token.status_code == 401
        assert reused_token.json()["code"] == "invalid_reset_token"
        assert client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "Password2"},
        ).status_code == 401
        assert client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "Password3"},
        ).status_code == 200

        assert client.get("/openapi.json").status_code == 200
        assert client.get("/docs").status_code == 200
