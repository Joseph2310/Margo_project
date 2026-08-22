from __future__ import annotations

import asyncio
from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
from typing import Any

from fastapi import WebSocket


@dataclass(eq=False)
class ChatConnection:
    websocket: WebSocket
    send_lock: asyncio.Lock = field(default_factory=asyncio.Lock)


class ChatConnectionManager:
    """Tracks this API process's authenticated chat connections."""

    def __init__(self) -> None:
        self._connections: dict[str, set[ChatConnection]] = {}
        self._lock = asyncio.Lock()

    async def add(self, user_id: str, websocket: WebSocket) -> ChatConnection:
        connection = ChatConnection(websocket)
        async with self._lock:
            self._connections.setdefault(user_id, set()).add(connection)
        return connection

    async def remove(self, user_id: str, connection: ChatConnection) -> None:
        async with self._lock:
            connections = self._connections.get(user_id)
            if not connections:
                return
            connections.discard(connection)
            if not connections:
                self._connections.pop(user_id, None)

    async def connected_user_ids(self) -> set[str]:
        async with self._lock:
            return {
                user_id
                for user_id, connections in self._connections.items()
                if connections
            }

    async def send_connection(
        self, connection: ChatConnection, event: dict[str, Any]
    ) -> None:
        async with connection.send_lock:
            await connection.websocket.send_json(event)

    async def send_to_users(
        self,
        user_ids: Iterable[str],
        event_factory: Callable[[str], dict[str, Any]],
    ) -> set[str]:
        async with self._lock:
            targets = [
                (user_id, connection)
                for user_id in set(user_ids)
                for connection in self._connections.get(user_id, set())
            ]

        async def send(
            user_id: str, connection: ChatConnection
        ) -> tuple[str, ChatConnection, bool]:
            try:
                async with connection.send_lock:
                    await connection.websocket.send_json(event_factory(user_id))
                return user_id, connection, True
            except Exception:
                return user_id, connection, False

        results = await asyncio.gather(
            *(send(user_id, connection) for user_id, connection in targets)
        )
        delivered_to: set[str] = set()
        for user_id, connection, succeeded in results:
            if succeeded:
                delivered_to.add(user_id)
            else:
                await self.remove(user_id, connection)
        return delivered_to


chat_manager = ChatConnectionManager()
