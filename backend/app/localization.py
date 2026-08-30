from typing import Annotated, Literal, TypeVar

from fastapi import Header


Language = Literal["ar", "en"]
T = TypeVar("T")


def get_language(
    accept_language: Annotated[str | None, Header(alias="Accept-Language")] = None,
) -> Language:
    if not accept_language:
        return "ar"
    primary_language = accept_language.split(",", maxsplit=1)[0].strip().lower()
    return "en" if primary_language.startswith("en") else "ar"


def localized(arabic: T, english: T | None, language: Language) -> T:
    return english if language == "en" and english is not None else arabic
