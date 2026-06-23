from __future__ import annotations

import time
from collections import defaultdict, deque


class RateLimiter:
    """Simple in-memory sliding-window limiter.

    Per-process only (fine as a first-line guard on public form endpoints).
    For multi-worker / multi-host deployments, back this with Redis later.
    """

    def __init__(self, max_calls: int, window_seconds: float) -> None:
        self.max_calls = max_calls
        self.window = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        bucket = self._hits[key]
        while bucket and now - bucket[0] > self.window:
            bucket.popleft()
        if len(bucket) >= self.max_calls:
            return False
        bucket.append(now)
        return True


# Public lead/consultation forms: at most 5 submissions per IP per 5 minutes.
lead_form_limiter = RateLimiter(max_calls=5, window_seconds=300)


def client_ip(request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
