import type { Env, Hono, MiddlewareHandler } from 'hono';
import { cache } from 'hono/cache';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { secureHeaders } from 'hono/secure-headers';

import * as b64 from '@std/encoding/base64';
import * as hex from '@std/encoding/hex';

import { generate }      from '@std/uuid/v5';
import { NAMESPACE_URL } from '@std/uuid/constants';

import { slugify } from '@std/text/unstable-slugify';
export { slugify };

import * as v from 'valibot';

export const { crypto: webcrypto } = globalThis;

export * as duration from './duration.ts';





export type Predicate <T> = (_: T) => boolean;





export function nothing <T> (): T | undefined {

    return void 0;

}





export const noop = createMiddleware(async function (_, next) {

    await next();

}) satisfies MiddlewareHandler;





export function gen_fnv1a_hash ({

        key = `Cool URIs Don't Change`,
        large = false,

} = {}) {

    return async function () {

        const { crypto: std_crypto } = await import('@std/crypto/crypto');
        const { encodeBase58 } = await import('@std/encoding/base58');

        return async function (message: string) {

            const entropy = await HMAC_SHA256({ key, message });

            const algo = large ? 'FNV64A' : 'FNV32A';

            const hash = await std_crypto.subtle.digest(algo, entropy);

            return encodeBase58(hash);

        };

    };

}





export function register (it: Iterable<{ href: string, remote: string }>, {

        timeout = 5000,

        request = (url: string) => fetch(url, {
            signal: AbortSignal.timeout(timeout),
        }),

} = {}) {

    return function <E extends Env> (hono: Hono<E>) {

        return Array.from(it).reduce(function (router, { href, remote }) {

            return router.get(href, () => request(remote));

        }, hono);

    };

}





export function cached (cacheName: string) {

    return cache({
        cacheName,
        cacheControl: 'public, max-age=31536000, immutable',
        wait: typeof globalThis.Deno?.version?.deno === 'string',
    });

}





// nmap :: (a -> b) -> a? -> b?
export function nmap <A, B> (

        f: (a: A) => B,
        a: A | undefined | null,

): B | undefined {

    if (a != null) {
        return f(a);
    }

}





export function exception (err: unknown) {

    if (err instanceof HTTPException) {
        return err.getResponse();
    }

    const status = 500;

    if (err instanceof Error) {
        return new Response(err.message, { status });
    }

    return new Response('unknown', { status });

}





export function lookup <T> (xs: Iterable<T>): Predicate<T> {

    const table = new Set(xs);

    return x => table.has(x);

}





export const wrap_by_quotes = wrap(`'`);

export function map_quotes (it: Iterable<string>) {

    return Array.from(it, wrap_by_quotes);

}

function wrap (open: string, close = open) {

    return function (str: string): string {

        return open.concat(str, close);

    };

}





export const challenge_ = prefix('challenge_');

function prefix (start: string) {

    return function (end: string) {

        return start.concat(end);

    };

}





export function mins (n: number) {

    return 1000 * 60 * n;

}





export function text_encode (str: string): Uint8Array {

    return txt.encode(str);

}





export function UUIDv4 (): string {

    return webcrypto.randomUUID();

}





export function UUIDv5_URL (origin: string) {

    return generate(NAMESPACE_URL, text_encode(origin));

}





export function compose_signing_url ({

        site,
        path = '/auth',
        ...rest

}: {

        state: string,
        challenge: string,
        client_id: string,
        redirect_uri: string,
        response_mode: 'body' | 'query' | 'fragment',
        site: string,
        path?: string,

}) {

    const params = new URLSearchParams(rest).toString();

    return site.concat(path, '#', params);

}





function within (ms: number) {

    return function <T extends number | string | Date> (value: NoInfer<T>) {

        const delta = Date.now() - new Date(value).valueOf();

        return delta < ms;

    };

}





function abort_early (message?: string) {

    return {
        message,
        abortEarly: true,
        abortPipeEarly: true,
    } satisfies v.Config<v.BaseIssue<unknown>>;

}





const v_signing_back = v.object({

    pub: v.pipe(
        v.string(),
        v.hexadecimal(),
    ),

    signature: v.pipe(
        v.string(),
        v.hexadecimal(),
    ),

    state: v.pipe(v.string(), v.uuid()),

    timestamp: v.pipe(
        v.string(),
        v.isoTimestamp(),
        v.check(within(mins(5)), 'outdated signing timestamp'),
    ),

});





export const v_optional_signing_back = v.pipe(

    v.partial(v_signing_back),

    v.transform(function ({ pub,   signature,   state,   timestamp }) {
        if (                pub && signature && state && timestamp  ) {
            return {        pub,   signature,   state,   timestamp };
        }
    }),

);





export async function calc_fingerprint (source: string | BufferSource) {

    const buf = typeof source === 'string' ? hex.decodeHex(source) : source;
    const hash = await webcrypto.subtle.digest('SHA-256', buf);
    const base64 = b64.encodeBase64(hash).replace(/=$/, '');

    return 'SHA256:'.concat(base64);

}





export function signingAuth (

        check: Iterable<string> | Predicate<string>,

): MiddlewareHandler {

    const authorized = typeof check === 'function' ? check : lookup(check);

    return createMiddleware(async function (ctx, next) {

        const data = await ctx.req.formData().then(v.parser(v.pipe(
            v.instance(FormData),
            v.transform(form => Object.fromEntries(form.entries())),
            v_signing_back,
            v.transform(function (origin) {

                const challenge = v.parse(
                    v.string('Sign On required'),
                    getCookie(ctx, challenge_(origin.state)),
                );

                const pub = hex.decodeHex(origin.pub);
                const signature = hex.decodeHex(origin.signature);
                const session = new URLSearchParams(origin).toString();

                return { ...origin, session, pub, signature, challenge };

            }),
        ), abort_early('invalid signing data')));

        const { session, ...signed } = data;

        const ok = await verify(signed);

        if (ok !== true) {
            throw new HTTPException(401, { message: 'verification failed' });
        }

        const fingerprint = await calc_fingerprint(signed.pub);

        if (authorized(fingerprint) !== true) {

            throw new HTTPException(401, {
                message: `unauthorized fingerprint - ${ fingerprint }`,
            });

        }

        ctx.set('session', session);

        await next();

    });

}





export async function verify ({ timestamp, challenge, signature, pub }: {

        timestamp: string,
        challenge: string,
        signature: BufferSource,
        pub: BufferSource,

}) {

    const sample = await HMAC_SHA256({
            key: timestamp,
        message: challenge,
    });

    return EdDSA({ pub, sample, signature });

}




async function EdDSA ({

           signature  ,  sample  ,  pub
}: Record<'signature' | 'sample' | 'pub', BufferSource>) {

    const algo = {
              name: 'Ed25519',
        namedCurve: 'Ed25519',
    } as const;

    const key = await webcrypto.subtle.importKey(
        'raw', pub, algo, false, [ 'verify' ]
    );

    return webcrypto.subtle.verify(algo, key, signature, sample);

}





const txt = new TextEncoder();

export async function HMAC_SHA256 ({ key, message }: {

        key: string,
        message: string,

}) {

    const name = 'HMAC';

    const crypto_key = await webcrypto.subtle.importKey(
        'raw',
        txt.encode(key),
        { name, hash: 'SHA-256' },
        false,
        [ 'sign' ],
    );

    return webcrypto.subtle.sign(name, crypto_key, txt.encode(message));

}





export function non_empty <const T> (x: T) {

    return function <const P extends unknown[]> (...xs: P) {

        return [ x, ...xs ] as const;

    };

}





export function parser <

    const T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,

> (schema: T) {

    return function (input: unknown) {

        const { success, issues, output } = v.safeParse(schema, input);

        if (success === true) {
            return output;
        }

        const [ { message } ] = issues;

        throw new HTTPException(400, { message });

    };

}





export const v_create = v.pipe(

    v.object({

        url: v.pipe(v.string('required: url'), v.trim(), v.url()),

        code: v.optional(v.pipe(v.string(), v.trim())),

    }),

    v.transform(function ({ url, code }) {

        if (code != null && code.length > 0) {
            return { url, code };
        }

        return { url };

    }),

);





export const v_id_slugify = v.object({

    id: v.pipe(v.string(), v.transform(slugify)),

});





export const read_var = v.parser(v.partial(v.object({

    ttl: v.number(),

    session: v.string(),

})));





export async function calc_integrity (content: string, {

    algo = 'SHA-256' as 'SHA-256' | 'SHA-384' | 'SHA-512',

} = {}) {

    const ab = await webcrypto.subtle.digest(algo, text_encode(content));

    const prefix = algo.toLowerCase().replace('-', '');

    const integrity = prefix.concat('-', b64.encodeBase64(ab));

    return integrity;

}





export function csp <

    P extends Parameters<typeof secureHeaders>[number],

> ({

        scriptSrc,

        formAction = [],

        frameAncestors = [
            'https://dash.deno.com',  // Deno Deploy Playground
        ],

}: NonNullable<NonNullable<P>['contentSecurityPolicy'] > = {}) {

    const data = 'data:';
    const none = wrap_by_quotes('none');
    const self = wrap_by_quotes('self');
    const unsafe_inline = wrap_by_quotes('unsafe-inline');

    const empty = Array.of<string>();

    return secureHeaders({

        referrerPolicy: 'same-origin',

        contentSecurityPolicy: {

            defaultSrc: [ none ],
            formAction: [ self, ...formAction ],
            styleSrc: [   self, unsafe_inline ],
            imgSrc: [     self, data ],

            scriptSrc: scriptSrc ?? [ none ],

            frameAncestors,

        },

        permissionsPolicy: {
            usb: empty,
            camera: empty,
            gyroscope: empty,
            microphone: empty,
            geolocation: empty,
            accelerometer: empty,
        },

    });

}

