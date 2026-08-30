import os
import re
import time
from typing import Any

import httpx


MAILPIT_BASE_URL = os.getenv("MAILPIT_BASE_URL", "http://mailpit:8025")


def verification_code_from_email(
    challenge: dict[str, Any], email: str
) -> str:
    exposed_code = challenge.get("verificationCode")
    if isinstance(exposed_code, str):
        return exposed_code

    with httpx.Client(
        base_url=MAILPIT_BASE_URL, timeout=5, trust_env=False
    ) as mailpit:
        for _ in range(20):
            response = mailpit.get(
                "/view/latest.txt", params={"query": f"to:{email}"}
            )
            if response.status_code == 200:
                match = re.search(r"\b(\d{6})\b", response.text)
                if match:
                    return match.group(1)
            time.sleep(0.1)
    raise AssertionError(f"No verification email was received for {email}")
