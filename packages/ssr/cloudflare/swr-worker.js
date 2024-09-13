// Compiled version at https://github.com/ecomplus/cloud-commerce/blob/main/packages/ssr/cloudflare/swr-worker.js
// Inspired by https://gist.github.com/wilsonpage/a4568d776ee6de188999afe6e2d2ee69
// Coalescing adapted from https://developers.cloudflare.com/durable-objects/examples/build-a-rate-limiter/
/* eslint-disable import/no-unresolved */
// @ts-ignore
import { DurableObject } from 'cloudflare:workers';

const HEADER_CACHE_CONTROL = 'Cache-Control';
const HEADER_SSR_TOOK = 'X-Load-Took';
const HEADER_STALE_AT = 'X-Edge-Stale-At';
const v = 38;
const resolveCacheControl = (response, { isPreventSoftStale, ageHardLimit } = {}) => {
  const cacheControl = response.headers.get(HEADER_CACHE_CONTROL);
  if (!cacheControl) {
    return { cacheControl };
  }
  const parts = cacheControl.replace(/ +/g, '').split(',');
  let { 'max-age': maxAge, 's-maxage': sMaxAge, 'stale-while-revalidate': staleMaxAge } = parts.reduce((result, part) => {
    const [key, value] = part.split('=');
    result[key] = Number(value) || 0;
    return result;
  }, {});
  if (!response.headers.get(HEADER_SSR_TOOK)) {
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('text/html') || !staleMaxAge) {
      return { cacheControl };
    }
  }
  if (ageHardLimit) {
    if (maxAge && maxAge > ageHardLimit) maxAge = ageHardLimit;
    if (sMaxAge && sMaxAge > ageHardLimit) sMaxAge = ageHardLimit;
    if (staleMaxAge && staleMaxAge > ageHardLimit) staleMaxAge = ageHardLimit;
  }
  const cdnMaxAge = typeof sMaxAge === 'number' ? sMaxAge : maxAge;
  if (!cdnMaxAge || cdnMaxAge <= 1) {
    return { cacheControl };
  }
  const staleAt = Date.now() + (cdnMaxAge * 1000);
  if (!staleMaxAge || staleMaxAge <= cdnMaxAge) {
    return { cacheControl, staleAt };
  }
  return {
    cacheControl: `public, max-age=${maxAge}, must-revalidate`
            + `, s-maxage=${(isPreventSoftStale ? cdnMaxAge : staleMaxAge)}`,
    staleAt,
  };
};
const addHeaders = (response, headers) => {
  const res = new Response(response.clone().body, {
    status: response.status,
    headers: response.headers,
  });
  Object.keys(headers).forEach((key) => {
    res.headers.delete(key);
    const value = headers[key];
    if (value) {
      res.headers.append(key, value);
    }
  });
  const redirectLocation = res.headers.get('location');
  if (redirectLocation) {
    const fixedRedirectLocation = redirectLocation
      .replace(/\?[tv]=\w*&?/, '?').replace(/\?$/, '');
    res.headers.set('location', fixedRedirectLocation);
  }
  return res;
};
const toCacheRes = (response, cacheControlOpts = {}) => {
  const { cacheControl, staleAt } = resolveCacheControl(response, cacheControlOpts);
  return addHeaders(response, {
    [HEADER_CACHE_CONTROL]: cacheControl,
    [HEADER_STALE_AT]: `${(staleAt || 0)}`,
    'set-cookie': null,
    'cf-cache-status': null,
    vary: null,
  });
};
const checkToKvCache = (newCacheRes) => {
  return newCacheRes.status === 200
        && newCacheRes.headers.get('Content-Type')?.includes('text/html');
};
const putKvCache = async (kv, kvKey, newCacheRes) => {
  const newKvRes = new Response(newCacheRes.clone().body, { status: 200 });
  const body = await newKvRes.text();
  const headers = {};
  newCacheRes.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const kvValue = JSON.stringify({ body, headers });
  return kv.put(kvKey, kvValue, { expirationTtl: 3600 * 24 * 30 });
};

export class CoalescingState extends DurableObject {
  updatingAt;
  constructor(ctx, env) {
    super(ctx, env);
    this.updatingAt = 0;
  }
  async setUpdatingAt(at) {
    this.updatingAt = at;
  }
  async checkUpdating() {
    return this.updatingAt + 15000 > Date.now();
  }
}

const swr = async (_rewritedReq, env, ctx) => {
  const _request = new Request(_rewritedReq.url.replace('/__swr/', '/'), {
    ..._rewritedReq,
    redirect: 'manual',
  });
  const url = new URL(_request.url);
  const { hostname, pathname } = url;
  const hostOverride = env[`OVERRIDE_${hostname}`];
  if (hostOverride) {
    url.hostname = hostOverride;
  }
  const bypassEarly = () => {
    return !hostOverride
      ? fetch(_request)
      : fetch(new Request(url.href, _request));
  };
  if (_request.method !== 'GET') {
    return bypassEarly();
  }
  if (pathname.startsWith('/_astro/')
        || pathname.startsWith('/img/')
        || pathname.startsWith('/assets/')
        || pathname.startsWith('/admin/')
        || pathname.startsWith('/_api/')
        || pathname.startsWith('/_image')
        || pathname.startsWith('/_analytics')
        || pathname.startsWith('/~')
        || pathname.startsWith('/.')
        || pathname.endsWith('.js')
        || pathname.endsWith('.css')) {
    return bypassEarly();
  }
  const [uri] = url.href.split('?', 2);
  const unloopUri = hostOverride ? uri : `${uri}?t=${Date.now()}`;
  const request = new Request(unloopUri, _request);
  const cacheKey = new Request(`${uri}?v=${(v + 1)}`, {
    method: _request.method,
  });
  const kvKey = `${v}${uri.replace('https:/', '')}`;
  const kv = env.PERMA_CACHE;
  let cachedRes;
  let edgeSource = '';
  try {
    const gettingCache = caches.default.match(cacheKey);
    const gettingKv = kv
      ? kv.get(kvKey, { type: 'json' }).then((value) => {
        if (value) {
          const { body, headers } = value;
          return new Response(body, { headers, status: 200 });
        }
        return undefined;
      })
      : Promise.resolve(undefined);
    cachedRes = await Promise.race([
      new Promise((resolve) => {
        gettingCache.then((fromCache) => {
          if (fromCache) {
            edgeSource = 'cache';
            resolve(fromCache);
            return;
          }
          gettingKv.finally(() => {
            setTimeout(() => resolve(null), 2);
          });
        });
      }),
      new Promise((resolve) => {
        gettingKv.then((fromKv) => {
          if (fromKv) {
            edgeSource = 'kv';
            resolve(fromKv);
            return;
          }
          gettingCache.finally(() => {
            setTimeout(() => resolve(null), 2);
          });
        });
      }),
    ]);
  } catch {
    //
  }
  let edgeState = 'miss';
  if (cachedRes) {
    const cachedStaleAt = Number(cachedRes.headers.get(HEADER_STALE_AT));
    if (!(cachedStaleAt > 0)) {
      edgeState = 'bypass';
    } else if (Date.now() > cachedStaleAt) {
      edgeState = 'stale';
      ctx.waitUntil((async () => {
        const coalescingId = env.COALESCING_STATE?.idFromName(kvKey);
        let coalescingStub;
        if (coalescingId) {
          try {
            coalescingStub = env.COALESCING_STATE.get(coalescingId);
            if (await coalescingStub.checkUpdating()) {
              return;
            }
          } catch {
            //
          }
        }
        if (coalescingStub) {
          await coalescingStub.setUpdatingAt(Date.now());
        }
        const response = await fetch(request);
        if (response.status > 199 && response.status < 500) {
          const newCdnCache = toCacheRes(response, { isPreventSoftStale: true });
          ctx.waitUntil(caches.default.put(cacheKey, newCdnCache));
        }
        const newKvCache = toCacheRes(response);
        if (kv && checkToKvCache(newKvCache)) {
          ctx.waitUntil(putKvCache(kv, kvKey, newKvCache));
        }
      })());
    } else {
      edgeState = 'fresh';
      if (edgeSource === 'kv') {
        const ageHardLimit = Math.ceil((cachedStaleAt - Date.now()) / 1000);
        if (ageHardLimit > 5) {
          const newCdnCache = toCacheRes(cachedRes, {
            isPreventSoftStale: true,
            ageHardLimit,
          });
          ctx.waitUntil(caches.default.put(cacheKey, newCdnCache));
        }
      }
    }
  }
  const response = cachedRes || await fetch(request);
  const { cacheControl } = resolveCacheControl(response);
  let iCdnCache = 0;
  let iKvCache = 0;
  if (!cachedRes) {
    if (response.status > 199 && response.status < 500) {
      const newCdnCache = toCacheRes(response, { isPreventSoftStale: true });
      ctx.waitUntil(caches.default.put(cacheKey, newCdnCache));
      iCdnCache = 1;
    }
    const newKvCache = toCacheRes(response);
    if (kv && checkToKvCache(newKvCache)) {
      ctx.waitUntil(putKvCache(kv, kvKey, newKvCache));
      iKvCache = 1;
    }
  }
  return addHeaders(response, {
    [HEADER_CACHE_CONTROL]: cacheControl,
    'x-edge-state': edgeState,
    'x-edge-src': !cachedRes
      ? `__NONE__; ${iCdnCache}${iKvCache}; v${v}`
      : `${edgeSource}; v${v}`,
  });
};

export default {
  fetch: swr,
};
