import { TtlCache } from '@std/cache/ttl-cache';

import type { AdapterGen } from './index.ts';
export type              * from './index.ts';





export const make_ttl_cache: AdapterGen = function () {

    const cache = new TtlCache<string, string>(2 ** 31);

    return {

        get: (id) => Promise.resolve(cache.get(id)),

        put: (id, link, { ttl } = {}) => new Promise(function (resolve) {

            if (cache.has(id)) {
                return resolve(false);
            }

            cache.set(id, link, ttl?.milliseconds());

            resolve(true);

        }),

        [Symbol.dispose] () {
            cache.clear();
        },

    };

}

