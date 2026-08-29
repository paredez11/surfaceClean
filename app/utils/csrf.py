# app/utils/csrf.py
from fastapi import Request, HTTPException

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def verify_csrf(request: Request):
    if request.method.upper() in SAFE_METHODS:
        return

    cookie_token = request.cookies.get("csrf_token")
    header_token = request.headers.get("x-csrf-token")

    if not cookie_token and not header_token:
        detail = "CSRF token missing"
    elif cookie_token and not header_token:
        detail = "CSRF header missing"
    elif not cookie_token and header_token:
        detail = "CSRF cookie missing"
    elif cookie_token != header_token:
        detail = "CSRF tokens did not match"
    else:
        return

    raise HTTPException(status_code=403, detail=detail)
