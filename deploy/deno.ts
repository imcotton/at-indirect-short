import type { MiddlewareHandler } from 'hono/types';

import { create_app } from '../app.tsx';
import { gen_deno_kv } from '../adapter/deno-kv.ts';
import { gen_fnv1a_hash } from '../utils.ts';





export function make ({

        auth, kv_path, cache_name, ttl_in_ms, hash_seed, hash_enlarge,
        signing_nav, signing_site,

}: {

        auth?: MiddlewareHandler,
        kv_path?: string,
        cache_name?: string,
        ttl_in_ms?: number,
        hash_seed?: string,
        hash_enlarge?: boolean,
        signing_nav?: boolean,
        signing_site?: string,

} = {}): Promise<Deno.ServeDefaultExport> {

    return create_app(gen_deno_kv(kv_path), {

        auth,
        cache_name,
        ttl_in_ms,
        signing_nav,
        signing_site,

        encoding: gen_fnv1a_hash({
            key: hash_seed,
            large: hash_enlarge,
        }),

    });

}





const app: Deno.ServeDefaultExport = await make();

export default app;

