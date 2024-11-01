import { getContext } from 'hono/context-storage';

import * as v from 'valibot';

import type { AdapterGen } from './index.ts';





export function gen_cloudflare_kv (ns: string): AdapterGen {

    return () => hook(ns);

}





function hook (ns: string) {

    return {

        async get (id: string) {

            const kv = get_kv(ns);
            const key = prefix_urls(id);

            const { success, output } = await kv.get(key).then(safe_url);

            if (success === true) {
                return output;
            }

        },

        put (id: string, link: string) {

            const kv = get_kv(ns);
            const key = prefix_urls(id);

            return kv.put(key, link).then(() => true, () => false);

        },

    };

}





interface KVNamespace {

    get (key: string): Promise<string>;

    put (key: string, value: string): Promise<void>;

}





function get_kv (ns: string): KVNamespace {

    const { env } = v.parse(v.object({

        env: v.object({

            [ns]: v.object({
                get: v.function(),
                put: v.function(),
            }),

        }),

    }), getContext());

    return env[ns] as never;

}





const safe_url = v.safeParser(v.pipe(v.string(), v.url()));

const prefix_urls = (id: string) => 'v1/urls:'.concat(id);

