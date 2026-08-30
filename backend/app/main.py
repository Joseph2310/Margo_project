from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.exceptions import register_exception_handlers
from app.routers import (
    auth,
    content,
    conversations,
    notifications,
    profile,
    questions,
    retreat,
    suggestions,
)
from app.schemas import ApiError, HealthResponse


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.app_debug,
    description=(
        "Backend contract for the Arabic and English Beneficiaries mobile "
        "application. Managed content follows the Accept-Language header. "
        "Authenticated endpoints use an HTTP Bearer access token. "
        "Real-time chat connects at /api/v1/conversations/ws and authenticates "
        "with an authenticate event containing the same access token. "
        "Business-controlled values such as points, attendance QR values, "
        "submission status, and duplicate awards are calculated by the server."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
    contact={"name": "Beneficiaries application team"},
    license_info={"name": "Proprietary"},
    responses={
        400: {"model": ApiError, "description": "Business rule or invalid request"},
        401: {"model": ApiError, "description": "Authentication required or invalid"},
        403: {"model": ApiError, "description": "Authenticated but not permitted"},
        404: {"model": ApiError, "description": "Requested resource not found"},
        409: {"model": ApiError, "description": "Resource state conflict"},
        422: {"model": ApiError, "description": "Field validation failed"},
        429: {"model": ApiError, "description": "Rate or attempt limit exceeded"},
        503: {"model": ApiError, "description": "External delivery service unavailable"},
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=settings.cors_origin_list != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
register_exception_handlers(app)


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Check API and database health",
)
def health(db: Session = Depends(get_db)) -> HealthResponse:
    db.execute(text("SELECT 1"))
    return HealthResponse(
        status="ok", database="connected", version=settings.app_version
    )


for api_router in (
    auth.router,
    profile.router,
    content.router,
    questions.router,
    retreat.router,
    conversations.router,
    suggestions.router,
    notifications.router,
):
    app.include_router(api_router, prefix=settings.api_prefix)
