import type { Plugin } from 'jsr:@luca/esbuild-deno-loader@0.11.0/esbuild_types';





export const esbuild_plugin: Plugin = {

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

        build.onResolve({ filter: /\.ts$/ }, async ({ path, kind, resolveDir }) => {

            if (resolveDir.includes('/node_modules/@')) {

                const fixed = path.replace(/ts$/, 'js');

                return build.resolve(fixed, { kind, resolveDir });

            }

        });

    },

};

