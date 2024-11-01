import type { MiddlewareHandler } from 'hono/types';
import { contextStorage } from 'hono/context-storage';

import { create_app } from '../app.tsx';
import { gen_cloudflare_kv } from '../adapter/unstable-cloudflare-kv.ts';
import { gen_fnv1a_hash_pure_js } from '../utils.ts';





export function make ({

        auth, kv_path, cache_name, ttl_in_ms, hash_seed, hash_enlarge,
        signing_nav, signing_site,

}: {

        auth?: MiddlewareHandler,
        kv_path: string,
        cache_name?: string,
        ttl_in_ms?: number,
        hash_seed?: string,
        hash_enlarge?: boolean,
        signing_nav?: boolean,
        signing_site?: string,

}): Promise<Deno.ServeDefaultExport> {

    const async_local_storage = contextStorage();

    return create_app(gen_cloudflare_kv(kv_path), {

        auth,
        async_local_storage,

        cache_name,
        ttl_in_ms,
        signing_nav,
        signing_site,

        encoding: gen_fnv1a_hash_pure_js({
            key: hash_seed,
            large: hash_enlarge,
        }),

    });

}

