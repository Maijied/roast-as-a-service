# 🥵 Roast as a Service (RaaS)

Random developer roasts, delivered via a blazing‑fast static API on GitHub Pages. Plug it into your apps, bots, terminals, or CI logs when “nice error messages” just aren’t enough.

---

## 🚀 What is RaaS?

Roast as a Service is a GitHub‑hosted, CDN‑backed JSON API that returns developer‑themed roasts in English and Bangla.  
It’s completely static (no servers), but feels dynamic thanks to a smart client SDK that shards, caches, and randomly selects roasts on the fly.

Use it when you want your:

- CLI tools to roast the user on failure.  
- CI pipeline to roast you when tests fail.  
- Discord/Slack bots to respond with spicy dev insults.  
- Portfolio or landing page to show random roasts on each visit.

---

## 🌐 Live Service

- **Website:** https://maijied.github.io/roast-as-a-service/
- **API Base:** https://maijied.github.io/roast-as-a-service/api/

---

## 📦 API Overview

This is a **static** API: data comes from versioned JSON files served over CDN, and a lightweight JS client handles randomness, filtering and caching in the browser.

### Endpoints (static JSON)

- **Manifest:**  
  `GET https://maijied.github.io/roast-as-a-service/api/manifest.json`

- **English Shard #1:**  
  `GET https://maijied.github.io/roast-as-a-service/api/en/roasts-en-1.json`

- **Bangla Shard #1:**  
  `GET https://maijied.github.io/roast-as-a-service/api/bn/roasts-bn-1.json`

### Example Response Structure
Each shard looks like:

```json
{
  "language": "en",
  "shard": 1,
  "total_shards": 5,
  "count": 300,
  "tags": ["dev", "general"],
  "roasts": [
    {
      "id": "en-1-1",
      "text": "Your codebase looks like it was written during a live outage.",
      "intensity": 2,
      "length": 61
    }
  ]
}
```

### Usage Example (curl + jq)
```bash
curl -s https://maijied.github.io/roast-as-a-service/api/en/roasts-en-1.json \
  | jq '.roasts[0].text'
```

---

## 🧬 Why this architecture is “state of the art”

Roast as a Service is intentionally built as a **static API** on top of GitHub Pages and a CDN, instead of a traditional backend. For this use case (serving pre‑made content), this gives you the same “API experience” with less cost, less complexity, and better global latency.

Key points:

- **Static JSON over CDN**  
  All responses are just versioned JSON files served by GitHub Pages’ global edge network, which is highly cache‑friendly and extremely fast for read‑heavy traffic.

- **Zero backend, zero cold starts**  
  There is no application server to boot, scale, or warm up. Every request hits static content that can be served from edge cache with minimal TTFB.

- **Sharded data layout**  
  Roasts are split into language‑specific shards (e.g. `en/roasts-en-1.json`) so each response stays small and cacheable even if the total dataset becomes large.

- **Client‑side selection and filtering**  
  A tiny SDK handles randomness, intensity filters, and length limits in the client, so the “API” stays read‑only and ultra fast instead of computing on every request.

- **Edge‑friendly cache behavior**  
  Because the content is static and not personalized, CDN nodes can cache responses aggressively without worrying about user‑specific data. That’s exactly what CDNs are optimized for.

- **Version‑controlled API**  
  All JSON lives in Git; you can roll back, branch, and review changes like any other codebase while GitHub Pages redeploys and re‑caches automatically.

This combination (static JSON + sharding + client‑side logic + CDN caching) is effectively the “fast path” that many dynamic APIs end up approximating with layers of caching—here it’s the default.
