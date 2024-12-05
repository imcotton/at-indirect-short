import type { MiddlewareHandler } from 'hono/types';

import { create_app } from '../app.tsx';
import { gen_deno_kv } from '../adapter/deno-kv.ts';
import { gen_fnv1a_hash } from '../encoder/jsr-std-wasm.ts';





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

    const hash = gen_fnv1a_hash({
        key: hash_seed,
        large: hash_enlarge,
    });

    const storage = gen_deno_kv(kv_path);

    return create_app(hash, storage, {
        auth,
        cache_name,
        ttl_in_ms,
        signing_nav,
        signing_site,
    });

}





const app: Deno.ServeDefaultExport = /* @__PURE__ */ await make();

export default app;

