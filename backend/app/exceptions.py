from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppError(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        field_errors: dict[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.field_errors = field_errors


def error_body(
    message: str, code: str, field_errors: dict[str, str] | None = None
) -> dict[str, Any]:
    body: dict[str, Any] = {"message": message, "code": code}
    if field_errors:
        body["fieldErrors"] = field_errors
    return body


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=error_body(exc.message, exc.code, exc.field_errors),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        field_errors: dict[str, str] = {}
        for error in exc.errors():
            location = [str(part) for part in error["loc"] if part != "body"]
            field = ".".join(location) or "request"
            field_errors[field] = str(error["msg"])
        return JSONResponse(
            status_code=422,
            content=error_body(
                "The request contains invalid fields.",
                "validation_error",
                field_errors,
            ),
        )
