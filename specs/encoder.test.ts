import * as ast from 'jsr:@std/assert@1';
import { describe, it } from 'jsr:@std/testing@1/bdd';

import { gen_fnv1a_hash as pure } from '../encoder/npm-pure.ts';
import { gen_fnv1a_hash as wasm } from '../encoder/jsr-std-wasm.ts';





const encoder = describe('encoder');

const url = 'http://example.net';

const key = 'hello, world';

const result = '3m3CSB';
const result_large = 'QF8t9Vgbnmd';
const result_large_salted = 'UW8KZNbHvBB';





describe(encoder, 'npm pure js', function () {

    it('has the same result', async function () {

        const res = await pure () (url);

        ast.assertStrictEquals(res, result);

    });

    it('has the same large result', async function () {

        const res = await pure ({ large: true }) (url);

        ast.assertStrictEquals(res, result_large);

    });

    it('has the same large result, salted', async function () {

        const res = await pure ({ large: true, key }) (url);

        ast.assertStrictEquals(res, result_large_salted);

    });

});





describe(encoder, 'jsr std wasm', function () {

    it('has the same result', async function () {

        const res = await wasm () (url);

        ast.assertStrictEquals(res, result);

    });

    it('has the same large result', async function () {

        const res = await wasm ({ large: true }) (url);

        ast.assertStrictEquals(res, result_large);

    });

    it('has the same large result, salted', async function () {

        const res = await wasm ({ large: true, key }) (url);

        ast.assertStrictEquals(res, result_large_salted);

    });

});

