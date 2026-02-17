"""
RaaS — Roast as a Service Python Client

A lightweight Python client for fetching developer roasts from the
RaaS static JSON API hosted on GitHub Pages.

Usage:
    from roast_api import get_random_roast, get_all_roasts

    roast = get_random_roast(lang='en')
    print(roast['text'])
"""

from roast_api.client import (
    get_random_roast,
    get_all_roasts,
    get_manifest,
    get_shard,
    clear_cache,
)

__version__ = "1.5.0"
__all__ = [
    "get_random_roast",
    "get_all_roasts",
    "get_manifest",
    "get_shard",
    "clear_cache",
]
