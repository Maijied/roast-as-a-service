# 🥵 Roast as a Service (RaaS)

<p align="center">
  <img src="https://maijied.github.io/roast-as-a-service/assets/logo.png" width="128" alt="RaaS Logo" />
</p>

Random developer roasts, delivered via a blazing‑fast static API on GitHub Pages. Plug it into your apps, bots, terminals, or CI logs when “nice error messages” just aren’t enough.

> **Part of the [Lorapok Ecosystem](https://github.com/Maijied/lorapok)** — Building the future of AI-driven developer tools. 🐛

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
- **Website:** https://maijied.github.io/roast-as-a-service/
- **API Base Path:** `https://maijied.github.io/roast-as-a-service/api/`

---

## ⚡ Quick Start

### 1. Script Include
Load the client SDK directly in your browser:

```html
<script src="https://maijied.github.io/roast-as-a-service/api/client.js"></script>

<script>
  // Fetch a random Bangla roast with intensity 2
  RaaS.getRandomRoast({ lang: 'bn', intensity: 2 })
    .then(r => console.log(r.text));
</script>
```

### 2. Direct Fetch
Or just fetch the JSON files directly:

```javascript
fetch('https://maijied.github.io/roast-as-a-service/api/en/roasts-en-1.json')
  .then(res => res.json())
  .then(data => {
    const list = data.roasts;
    const pick = list[Math.floor(Math.random() * list.length)];
    console.log(pick.text);
  });
```

---

## 🛠 How it works

RaaS exposes sharded JSON datasets over GitHub Pages, then a tiny client SDK picks, filters, and caches roasts in the browser, giving you an API‑like experience with pure static hosting.

- **Static API**: Roasts are stored in language‑specific shards (`en`, `bn`) and served as JSON over GitHub Pages’ global CDN for low TTFB.
- **Smart client**: The bundled client fetches a small shard, caches it, and returns random roasts with optional intensity and length filters.
- **Zero ops**: No servers, no cold starts, no scaling issues. Push to main, let Pages deploy and cache everything at the edge.

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

---

## 🐛 More from Lorapok

RaaS is a proud member of the **Lorapok** family. Check out our other tools:

- **[Lorapok CLI](https://github.com/Maijied/lorapok):** The intelligent AI agent framework for developers.
- **[Lorapok Media Player](https://github.com/Maijied/Lorapok_Media_Player):** A modern, feature-rich media player built for power users.

---