import type { Plugin } from 'esbuild-deno-loader/esbuild_types';

export * from 'hono/combine';

export { basicAuth } from 'hono/basic-auth';
export { bearerAuth } from 'hono/bearer-auth';

export { signingAuth } from './utils.ts';





export const hotfix: Plugin = {

    name: 'hotfix',

    setup (build) {

        build.onResolve({ filter: /^jsr:/ }, ({ path, kind, resolveDir }) => {

            const fixed = path
                .replace(/^jsr:\/?@/, 'AT-JSR')
                .replace('/', '__')
                .replace(/@[^/]+/, '')
                .replace('AT-JSR', '@jsr/')
            ;

            return build.resolve(fixed, { kind, resolveDir });

        });

    },

};

