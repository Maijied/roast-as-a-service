const RaaS = (() => {
  const BASE_URL = 'https://maijied.github.io/roast-as-a-service/api';
  const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

  let manifestCache = null;
  let memoryCache = {};

  // Universal fetch (works in Node.js 18+ and browsers)
  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    return res.json();
  }

  async function getManifest() {
    if (manifestCache) return manifestCache;
    const data = await fetchJSON(`${BASE_URL}/manifest.json`);
    manifestCache = data;
    return data;
  }

  function getLocalCacheKey(lang, shard) {
    return `raas-${lang}-${shard}`;
  }

  function readLocalCache(lang, shard) {
    const key = getLocalCacheKey(lang, shard);

    // Try localStorage (browser)
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.ts > CACHE_TTL_MS) {
          localStorage.removeItem(key);
          return null;
        }
        return parsed.data;
      } catch {
        localStorage.removeItem(key);
        return null;
      }
    }

    // Fallback to memory cache (Node.js)
    const cached = memoryCache[key];
    if (cached && Date.now() - cached.ts <= CACHE_TTL_MS) {
      return cached.data;
    }
    return null;
  }

  function writeLocalCache(lang, shard, data) {
    const key = getLocalCacheKey(lang, shard);
    const cacheObj = { ts: Date.now(), data };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(cacheObj));
    } else {
      memoryCache[key] = cacheObj;
    }
  }

  function pickRandomIndex(max) {
    return Math.floor(Math.random() * max);
  }

  function filterRoasts(list, options) {
    if (!options) return list;
    let result = list;
    if (options.intensity) {
      result = result.filter(r => r.intensity === options.intensity);
    }
    if (options.maxLength) {
      result = result.filter(r => r.length <= options.maxLength);
    }
    return result.length ? result : list;
  }

  async function getRandomRoast(options = {}) {
    const lang = options.lang || 'en';
    const manifest = await getManifest();
    const langInfo = manifest.languages[lang];
    if (!langInfo) throw new Error('Language not supported');

    const shardCount = langInfo.shards;
    const shard = 1 + pickRandomIndex(shardCount);

    let shardData = readLocalCache(lang, shard);
    if (!shardData) {
      shardData = await fetchJSON(`${BASE_URL}/${lang}/roasts-${lang}-${shard}.json`);
      writeLocalCache(lang, shard, shardData);
    }

    const list = filterRoasts(shardData.roasts, options);
    const idx = pickRandomIndex(list.length);
    const roast = list[idx];

    return {
      language: shardData.language,
      shard: shardData.shard,
      id: roast.id,
      text: roast.text,
      intensity: roast.intensity,
      length: roast.length
    };
  }

  const api = {
    getRandomRoast,
    getManifest
  };

  // CommonJS export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  return api;
})();

// For browser global usage
if (typeof window !== 'undefined') {
  window.RaaS = RaaS;
}
