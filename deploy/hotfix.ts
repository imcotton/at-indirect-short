import type { Plugin } from 'jsr:@luca/esbuild-deno-loader@0.11.0/esbuild_types';





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

