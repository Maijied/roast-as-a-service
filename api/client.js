const RaaS = (() => {
  const BASE_URL = 'https://maijied.github.io/roast-as-a-service/api';
  const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

  let manifestCache = null;

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: 'force-cache' });
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

  function writeLocalCache(lang, shard, data) {
    const key = getLocalCacheKey(lang, shard);
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
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
      text: roast.text,
      intensity: roast.intensity,
      length: roast.length
    };
  }

  return {
    getRandomRoast,
    getManifest
  };
})();
