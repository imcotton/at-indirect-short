import { getContext } from 'hono/context-storage';

import * as v from 'valibot';

import type { Adapter, AdapterGen } from './index.ts';





export function gen_cloudflare_kv (ns: string): AdapterGen {

    return () => hook(ns);

}





function hook (ns: string): Adapter {

    return {

        async get (id) {

            const kv = get_kv(ns);
            const key = prefix_urls(id);

            const { success, output } = await kv.get(key).then(safe_url);

            if (success === true) {
                return output;
            }

        },

        async put (id, link, { ttl } = {}) {

            const kv = get_kv(ns);
            const key = prefix_urls(id);

            const exist = await kv.get(key);

            if (exist != null) {
                return false;
            }

            const expirationTtl = ttl?.seconds();

            const metadata = {
                create_date: new Date().toISOString(),
            };

            await kv.put(key, link, { expirationTtl, metadata });

            return true;

        },

        async del (id) {

            const kv = get_kv(ns);
            const key = prefix_urls(id);

            await kv.delete(key);

            return true;

        },

        [Symbol.dispose] () {
            // noop
        },

    };

}





interface KVNamespace {

    get (key: string): Promise<string | undefined>;

    put (key: string, value: string, opts?: {

            expirationTtl?: number,
            metadata?: object,

    }): Promise<void>;

    delete (key: string): Promise<void>;

}





function get_kv (ns: string): KVNamespace {

    type Env = {
        Bindings: Record<string, KVNamespace>,
    };

    const { [ns]: kv } = getContext<Env>().env;

    v.assert(safe_kv, kv);

    return kv;

}





const safe_kv = v.object({

    get: v.function(),
    put: v.function(),
    delete: v.function(),

}, 'invalid worker kv');

const safe_url = v.safeParser(v.pipe(v.string(), v.url()));

const prefix_urls = (id: string) => 'v1/urls:'.concat(id);

