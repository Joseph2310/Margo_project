import asyncio
import json
import os
import time
import uuid
from typing import Any

import httpx
import websockets


API_BASE_URL = os.getenv("API_BASE_URL", "http://api:8000")
WEBSOCKET_URL = (
    API_BASE_URL.replace("https://", "wss://").replace("http://", "ws://")
    + "/api/v1/conversations/ws"
)


def auth_headers(access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token}"}


def register_verified_user(client: httpx.Client, label: str) -> dict[str, Any]:
    email = f"chat-{label}-{uuid.uuid4()}@example.com"
    registration = client.post(
        "/api/v1/auth/register",
        json={
            "name": f"مستخدمة {label}",
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
    verification = client.post(
        "/api/v1/auth/verification/verify",
        json={
            "email": email,
            "code": registration.json()["verificationCode"],
            "mode": "registration",
        },
    )
    assert verification.status_code == 200, verification.text
    return verification.json()["session"]


async def receive_event(
    socket: Any,
    event_type: str,
    *,
    message_id: str | None = None,
    timeout: float = 20,
) -> dict[str, Any]:
    deadline = time.monotonic() + timeout
    while True:
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise AssertionError(f"Timed out waiting for {event_type}")
        event = json.loads(await asyncio.wait_for(socket.recv(), remaining))
        if event.get("type") != event_type:
            continue
        data = event.get("data", {})
        nested_message = data.get("message")
        event_message_id = data.get("messageId") or (
            nested_message.get("id") if isinstance(nested_message, dict) else None
        )
        if message_id is None or event_message_id == message_id:
            return event


async def authenticate_socket(socket: Any, token: str) -> None:
    await socket.send(json.dumps({"type": "authenticate", "accessToken": token}))
    connected = await receive_event(socket, "chat.connected")
    assert connected["data"]["connectedAt"]


def test_authenticated_bidirectional_realtime_chat() -> None:
    with httpx.Client(base_url=API_BASE_URL, timeout=20, trust_env=False) as client:
        session_a = register_verified_user(client, "A")
        session_b = register_verified_user(client, "B")
        headers_a = auth_headers(session_a["accessToken"])
        headers_b = auth_headers(session_b["accessToken"])

        private_access = client.get(
            "/api/v1/conversations/miss-marina", headers=headers_b
        )
        assert private_access.status_code == 404

        async def exercise_chat() -> None:
            async with websockets.connect(WEBSOCKET_URL) as socket_a:
                async with websockets.connect(WEBSOCKET_URL) as socket_b:
                    await authenticate_socket(socket_a, session_a["accessToken"])
                    await authenticate_socket(socket_b, session_b["accessToken"])

                    content_a = f"A to B {uuid.uuid4()}"
                    sent_a = client.post(
                        "/api/v1/conversations/messages",
                        headers=headers_a,
                        json={
                            "conversationId": "all",
                            "content": content_a,
                            "kind": "text",
                            "anonymous": True,
                        },
                    )
                    assert sent_a.status_code == 201, sent_a.text
                    message_a = sent_a.json()["message"]
                    event_a = await receive_event(
                        socket_a, "message.created", message_id=message_a["id"]
                    )
                    event_b = await receive_event(
                        socket_b, "message.created", message_id=message_a["id"]
                    )
                    assert event_a["data"]["message"]["isMine"] is True
                    assert event_b["data"]["message"]["isMine"] is False
                    assert event_b["data"]["message"]["senderName"] == "مجهول الهوية"
                    delivered = await receive_event(
                        socket_a, "message.status", message_id=message_a["id"]
                    )
                    assert delivered["data"]["status"] == "delivered"

                    marked_read = client.post(
                        "/api/v1/conversations/all/read", headers=headers_b
                    )
                    assert marked_read.status_code == 200, marked_read.text
                    read_event = await receive_event(
                        socket_a, "message.status", message_id=message_a["id"]
                    )
                    assert read_event["data"]["status"] == "read"
                    assert read_event["data"]["readAt"]

                    content_b = f"B to A {uuid.uuid4()}"
                    sent_b = client.post(
                        "/api/v1/conversations/messages",
                        headers=headers_b,
                        json={
                            "conversationId": "all",
                            "content": content_b,
                            "kind": "text",
                            "anonymous": False,
                        },
                    )
                    assert sent_b.status_code == 201, sent_b.text
                    message_b = sent_b.json()["message"]
                    reply_for_a = await receive_event(
                        socket_a, "message.created", message_id=message_b["id"]
                    )
                    reply_for_b = await receive_event(
                        socket_b, "message.created", message_id=message_b["id"]
                    )
                    assert reply_for_a["data"]["message"]["isMine"] is False
                    assert reply_for_b["data"]["message"]["isMine"] is True

                async with websockets.connect(WEBSOCKET_URL) as reconnected_b:
                    await authenticate_socket(
                        reconnected_b, session_b["accessToken"]
                    )
                    after_reconnect = f"after reconnect {uuid.uuid4()}"
                    sent_after_reconnect = client.post(
                        "/api/v1/conversations/messages",
                        headers=headers_a,
                        json={
                            "conversationId": "all",
                            "content": after_reconnect,
                            "kind": "text",
                            "anonymous": False,
                        },
                    )
                    assert sent_after_reconnect.status_code == 201
                    received = await receive_event(
                        reconnected_b,
                        "message.created",
                        message_id=sent_after_reconnect.json()["message"]["id"],
                    )
                    assert received["data"]["message"]["content"] == after_reconnect

                    history = client.get(
                        "/api/v1/conversations/all", headers=headers_b
                    )
                    assert history.status_code == 200
                    history_contents = {
                        item["content"] for item in history.json()["messages"]
                    }
                    assert {content_a, content_b, after_reconnect} <= history_contents

            async with websockets.connect(WEBSOCKET_URL) as invalid_socket:
                await invalid_socket.send(
                    json.dumps({"type": "authenticate", "accessToken": "invalid"})
                )
                error = await receive_event(invalid_socket, "chat.error")
                assert error["data"]["code"] == "invalid_token"

        asyncio.run(exercise_chat())
