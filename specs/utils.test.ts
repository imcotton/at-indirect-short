import * as ast from 'jsr:@std/assert@1';
import { describe, it } from 'jsr:@std/testing@1/bdd';

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import {

    exception,
    register,

} from '../utils.ts';





const utils = describe('utils');





describe(utils, 'exception', function () {

    it('return response on HTTPException', async function () {

        const data = 'foobar';
        const res = new Response(data);
        const exp = new HTTPException(404, { res });

        const result = exception(exp);
        const txt = await result.text();

        ast.assertStrictEquals(txt, data);

    });

    it('return response 500 with error message', async function () {

        const message = 'wat';
        const err = new Error(message);

        const result = exception(err);
        const msg = await result.text();

        ast.assertStrictEquals(result.status, 500);
        ast.assertStrictEquals(msg, message);

    });

    it('return response unknown', async function () {

        const result = exception('wat');
        const txt = await result.text();

        ast.assertStrictEquals(result.status, 500);
        ast.assertStrictEquals(txt, 'unknown');

    });

});





describe(utils, 'register', function () {

    it('extend app', async function () {

        const href = '/static';
        const remote = 'https://example/cdn';

        const response = new Response('foobar');

        const request = () => Promise.resolve(response);

        const extend = register([ { href, remote } ], { request });

        const app = extend(new Hono());

        const res = await app.request(href);

        ast.assertStrictEquals(res, response);

    });

    it('fire native fetch', async function () {

        const data = 'foobar';
        const href = '/static';
        const remote = 'http://localhost/example';

        const extend = register([ { href, remote } ]);

        const app = extend(new Hono()).onError(function () {

            return new Response(data);

        });

        const res = await app.request(href);
        const txt = await res.text();

        ast.assertStrictEquals(txt, data);

    });

});

