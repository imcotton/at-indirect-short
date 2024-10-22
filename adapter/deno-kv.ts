import * as v from 'valibot';

import { non_empty } from '../utils.ts';

import type { AdapterGen } from './index.ts';
export type              * from './index.ts';





export function gen_deno_kv (path?: string): AdapterGen {

    return () => globalThis.Deno.openKv(path).then(hook);

}





function hook (kv: Deno.Kv) {

    return {

        async get (id: string) {

            const { success, output } = await kv.get(keys.urls(id), {

                consistency: 'eventual',

            }).then(v.safeParser(schemas.urls));

            if (success === true) {
                return output.value;
            }

        },

        async put (id: string, link: string) {

            const urls = keys.urls(id);
            const create_date = keys.create_date(id);

            const versionstamp = null;
            const iso_date = new Date().toISOString();

            const { ok } = await kv.atomic()
                .check({ versionstamp, key: urls })
                .check({ versionstamp, key: create_date })
                .set(urls, link)
                .set(create_date, iso_date)
                .commit()
            ;

            return ok;

        },

    };

}





const prefix_urls        = 'v1/urls';
const prefix_create_date = 'v1/create_date';

const keys = {

           urls: non_empty(prefix_urls),
    create_date: non_empty(prefix_create_date),

};

const schemas = mk_schemas({

           urls: prefix_urls,
    create_date: prefix_create_date,

});

function mk_schemas ({

           urls  ,  create_date
}: Record<'urls' | 'create_date', string>) {

    const versionstamp = v.string();
    const iso = v.pipe(v.string(), v.isoTimestamp());

    return {

        urls: v.object({
            versionstamp,
            key: v.strictTuple([ v.literal(urls), v.string() ]),
            value: v.pipe(v.string(), v.url()),
        }),

        create_date: v.object({
            versionstamp,
            key: v.strictTuple([ v.literal(create_date), v.string() ]),
            value: iso,
        }),

    };

}

