import type { AdapterGen } from './index.ts';
export type              * from './index.ts';





export const make_map_object: AdapterGen = function () {

    const store = new Map<string, string>();

    return {

        get: (id) => Promise.resolve(store.get(id)),

        put: (id, link) => new Promise(function (resolve) {

            if (store.has(id)) {
                return resolve(false);
            }

            store.set(id, link);

            resolve(true);

        }),

        del: (id) => Promise.resolve(store.delete(id)),

        [Symbol.dispose] () {
            store.clear();
        },

    };

};

