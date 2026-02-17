"""
RaaS Python Client — core logic.

Fetches roasts from the static JSON API on GitHub Pages,
with in-memory caching and optional filtering.
"""

import random
from typing import Any, Dict, List, Optional

import requests

BASE_URL = "https://maijied.github.io/roast-as-a-service/api"

# In-memory caches
_manifest_cache: Optional[Dict[str, Any]] = None
_shard_cache: Dict[str, Dict[str, Any]] = {}


def get_manifest() -> Dict[str, Any]:
    """Fetch and cache the API manifest."""
    global _manifest_cache
    if _manifest_cache is not None:
        return _manifest_cache

    url = f"{BASE_URL}/manifest.json"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    _manifest_cache = resp.json()
    return _manifest_cache


def get_shard(lang: str = "en", shard: int = 1) -> Dict[str, Any]:
    """Fetch and cache a specific language shard."""
    key = f"{lang}-{shard}"
    if key in _shard_cache:
        return _shard_cache[key]

    url = f"{BASE_URL}/{lang}/roasts-{lang}-{shard}.json"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    _shard_cache[key] = resp.json()
    return _shard_cache[key]


def get_random_roast(
    lang: str = "en",
    intensity: Optional[int] = None,
    max_length: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Get a random roast.

    Args:
        lang: Language code ('en' or 'bn'). Default: 'en'.
        intensity: Filter by intensity (1–3). Default: None (any).
        max_length: Maximum text length. Default: None (any).

    Returns:
        A dict with keys: id, text, intensity, length.

    Raises:
        ValueError: If no roasts match the given filters.
    """
    data = get_shard(lang)
    roasts: List[Dict[str, Any]] = data.get("roasts", [])

    if intensity is not None:
        roasts = [r for r in roasts if r.get("intensity") == intensity]
    if max_length is not None:
        roasts = [r for r in roasts if r.get("length", 0) <= max_length]

    if not roasts:
        raise ValueError("No roasts match the given filters.")

    return random.choice(roasts)


def get_all_roasts(lang: str = "en") -> List[Dict[str, Any]]:
    """Get all roasts for a language."""
    data = get_shard(lang)
    return data.get("roasts", [])


def clear_cache() -> None:
    """Clear the in-memory caches."""
    global _manifest_cache, _shard_cache
    _manifest_cache = None
    _shard_cache = {}
