import * as ast from 'jsr:@std/assert@1';
import * as hex from 'jsr:@std/encoding@1/hex';
import { getCookies, setCookie } from 'jsr:@std/http@1/cookie';

import { Hono } from 'hono';
import { testClient } from 'hono/testing';

import { create_app } from '../app.tsx';
import { gen_deno_kv } from '../adapter/deno-kv.ts';
import { make_map_object } from '../adapter/map-object.ts';
import { calc_fingerprint, gen_fnv1a_hash,
    HMAC_SHA256, signingAuth, UUIDv4, webcrypto,
} from '../utils.ts';





const app = await create_app(gen_deno_kv(':memory:'), {
    insecure: true,
    signing_nav: true,
});

const client = testClient(app);
const post = client.index.$post;

const go = (id = '') => '/go/'.concat(id);

const text: (p: Promise<Response>) => Promise<string>
= p => p.then(r => r.text());





Deno.test('index page', async function () {

    const res = await app.request('/');

    ast.assert(res.headers.get('content-type')?.includes('text/html'));

    const html = await res.text();

    ast.assertStringIncludes(html, '<main');
    ast.assertStringIncludes(html, 'method="post"');

});

Deno.test('/go/wat - 404', async function () {

    const { ok, status } = await app.request(go('wat'));

    ast.assertObjectMatch({ ok, status }, { ok: false, status: 404, });

});

Deno.test('post invalid url', async function () {

    const { ok, status } = await post({ form: { url: 'wat' } });

    ast.assertObjectMatch({ ok, status }, { ok: false, status: 400, });

});

Deno.test('post url', async function () {

    const url = 'https://example.com';

    const txt = await text(post({ form: { url } }));

    ast.assertStringIncludes(txt, go());

});

Deno.test('post url by show html page', async function () {

    const url = 'https://example.com';
    const code = 'show-the-web-page';

    const res = await post({
        // @ts-expect-error optional query
        query: { show: 'page' },
        form: { url, code },
    });

    ast.assert(res.headers.get('content-type')?.includes('text/html'));

    const html = await res.text();

    ast.assertStringIncludes(html, '<body');
    ast.assertStringIncludes(html, '<main');
    ast.assertStringIncludes(html, go(code));

});

Deno.test('post url and code', async function () {

    const url = 'https://example.com';
    const code = 'example';

    { // put

        const txt = await text(post({ form: { url, code } }));

        ast.assert(txt.endsWith(go(code)));

    }

    { // get

        const { status, headers } = await app.request(go(code));

        ast.assertStrictEquals(status, 302);
        ast.assertStrictEquals(headers.get('location'), url);

    }

});

Deno.test('throw on same code twice', async function () {

    const url = 'https://example.com';
    const code = 'one-two';

    const one = await post({ form: { url, code } });

    ast.assertStrictEquals(one.ok, true, 'one');

    const { ok, status } = await post({ form: { url, code } });

    ast.assertObjectMatch({ ok, status }, { ok: false, status: 409 });

});

Deno.test('advanced config', async function () {

    const other = await create_app(make_map_object, {
        encoding: gen_fnv1a_hash({ large: true, key: 'ayb' }),
        insecure: true,
    });

    const example = 'https://example.com';

    { // url only

        const res = await create(other, example);
        ast.assertStrictEquals(res.headers.get('location'), example);

    } { // first code=foobar

        const res = await create(other, example, 'foobar');
        ast.assertStrictEquals(res.headers.get('location'), example);

    } { // second code=foobar

        const res = await create(other, example, 'foobar');
        ast.assertStrictEquals(res.status, 409);

    } { // go/wat

        const missing = await other.request('/go/wat');
        ast.assertStrictEquals(missing.status, 404);

    }

    async function create (hono: Hono, url: string, code?: string) {

        const body = new FormData();
        body.set('url', url);

        if (code) {
            body.set('code', code);
        }

        const res = await hono.request(new Request('http://localhost', {
            method: 'POST',
            body,
        }));

        if (res.ok === false) {
            return res;
        }

        const txt = await res.text();

        return hono.request(txt);

    }

});

Deno.test('default app', async function () {

    await create_app(make_map_object);

});

Deno.test('/sign-on', async function () {

    const res = await app.request('/sign-on', { method: 'post' });

    const location = res.headers.get('location');

    ast.assert(location, 'has redirect url');

    const query = new URLSearchParams(new URL(location).hash);

    const cookie = getCookies(new Headers(
        res.headers.getSetCookie().map(value => [ 'Cookie', value ]),
    ));

    ast.assertStrictEquals(query.get('challenge'), cookie['challenge']);

});

Deno.test('/sign-on-back', async function () {

    const rand = (n: number) => hex.encodeHex(
        webcrypto.getRandomValues(new Uint8Array(n))
    );

    const state = UUIDv4();
    const timestamp = new Date().toISOString();
    const pub = rand(32);
    const signature = rand(48);

    const query = new URLSearchParams({ state, timestamp, pub, signature });

    const res = await app.request('/?'.concat(query.toString()));
    const txt = await res.text();

    ast.assertStrictEquals(res.ok, true);
    ast.assertStringIncludes(txt, '<main');
    ast.assertStringIncludes(txt, 'Sign Out');
    ast.assertStringIncludes(txt, 'signing info...');

});

Deno.test('signingAuth', async function () {

    const data = 'foobar';
    const state = UUIDv4();
    const challenge = UUIDv4();
    const timestamp = new Date().toISOString();

    const sample = await HMAC_SHA256({
        key: timestamp,
        message: challenge,
    });

    const name = 'Ed25519';

    const { privateKey, publicKey } = await webcrypto.subtle.generateKey(
        { name, namedCurve: name },
        false,
        [ 'sign' ],
    );

    const pub = await webcrypto.subtle.exportKey('raw', publicKey);
    const fingerprint = await calc_fingerprint(pub);

    const signature = await webcrypto.subtle.sign(
        name,
        privateKey,
        sample,
    );

    const tmp = new Headers();

    setCookie(tmp, { name: 'challenge', value: challenge });

    const headers = Object.fromEntries(
        tmp.getSetCookie().map(value => [ 'Cookie', value ])
    );

    const form = {
        state,
        timestamp,
        pub: hex.encodeHex(pub),
        signature: hex.encodeHex(signature),
        url: 'http://example',
    };

    { // ok

        const auth = signingAuth([ fingerprint ]);

        const client = testClient(new Hono().post('/submit', auth, ctx => {
            return ctx.text(data);
        }));

        const res = await client.submit.$post({ form }, { headers });
        const txt = await res.text();

        ast.assertStrictEquals(txt, data);

    }

    { // ok on show page

        const client = testClient(await create_app(make_map_object, {
            auth: signingAuth([ fingerprint ]),
            insecure: true,
        }));

        const query = { show: 'page' };

        // @ts-expect-error optional query
        const res = await client.index.$post({ form, query }, { headers });
        const txt = await res.text();

        ast.assertStringIncludes(txt, 'signature=');

    }

    { // not ok

        const auth = signingAuth(() => true);

        const client = testClient(new Hono().post('/submit', auth));

        const { ok, status } = await client.submit.$post(
            { form: { ...form, signature: '1234abcd' } },
            { headers },
        );

        ast.assertObjectMatch({ ok, status }, { ok: false, status: 401 });

    }

    { // unauthorized

        const auth = signingAuth(() => false);

        const { submit } = testClient(new Hono().post('/submit', auth));

        const { ok, status } = await submit.$post({ form }, { headers });

        ast.assertObjectMatch({ ok, status }, { ok: false, status: 401 });

    }

});

