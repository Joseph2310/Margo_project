from app.localization import get_language, localized


def test_accept_language_detection() -> None:
    assert get_language(None) == "ar"
    assert get_language("ar-EG,ar;q=0.9") == "ar"
    assert get_language("en-US,en;q=0.9") == "en"


def test_localized_value_uses_arabic_as_fallback() -> None:
    assert localized("الصلاة", "Prayer", "en") == "Prayer"
    assert localized("الصلاة", None, "en") == "الصلاة"
    assert localized("الصلاة", "Prayer", "ar") == "الصلاة"
