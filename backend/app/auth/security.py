import base64
import hashlib
import hmac
import json
import os
import secrets
import time


SECRET_KEY = os.getenv("SECRET_KEY", "cambia-esta-clave-en-produccion-portal-simulacion")
TOKEN_TTL_SECONDS = int(os.getenv("TOKEN_TTL_SECONDS", "28800"))
PBKDF2_ITERATIONS = 310_000


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def hash_password(password: str) -> str:
    if len(password) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${_b64encode(salt)}${_b64encode(digest)}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt, expected = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), _b64decode(salt), int(iterations)
        )
        return hmac.compare_digest(_b64encode(digest), expected)
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: int, role: str) -> str:
    header = _b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64encode(
        json.dumps(
            {"sub": str(user_id), "role": role, "exp": int(time.time()) + TOKEN_TTL_SECONDS},
            separators=(",", ":"),
        ).encode()
    )
    signature = _b64encode(hmac.new(SECRET_KEY.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest())
    return f"{header}.{payload}.{signature}"


def decode_access_token(token: str) -> dict:
    try:
        header, payload, signature = token.split(".")
        expected = _b64encode(
            hmac.new(SECRET_KEY.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
        )
        if not hmac.compare_digest(signature, expected):
            raise ValueError("Firma inválida")
        data = json.loads(_b64decode(payload))
        if int(data.get("exp", 0)) < int(time.time()):
            raise ValueError("Token vencido")
        return data
    except (ValueError, KeyError, json.JSONDecodeError) as exc:
        raise ValueError("Token inválido") from exc

