/** @jsx jsx */ void jsx;

import { Hono, type Env } from 'hono';
import { jsx } from 'hono/jsx';
import { setCookie } from 'hono/cookie';
import { csrf } from 'hono/csrf';
import { validator } from 'hono/validator';
import { HTTPException } from 'hono/http-exception';

import * as v from 'valibot';

import type { AdapterGen } from './adapter/index.ts';

import { layout, Create, SigningPane } from './components/index.tsx';
import { Show, scriptSrc } from './components/show.tsx';

import { duration_in_milliseconds } from './duration.ts';

import { collection } from './assets.ts';

import { noop, csp, cached, register, gen_fnv1a_hash,
    parser, v_create, v_optional_signing_back, read_var,
    UUIDv4, UUIDv5_URL, compose_signing_url, calc_fingerprint,
    nmap, nothing, slugify, exception, challenge_,
} from './utils.ts';





export async function create_app <E extends Env> (storage: AdapterGen, {

        auth = noop,
        encoding = gen_fnv1a_hash(),
        cache_name = 'assets-v1',
        ttl_in_ms = nothing<number>(),
        signing_nav = false,
        signing_site = 'https://sign-poc.js.org',
        insecure = false,

} = {}) {

    const db = await storage();
    const hash = await encoding();

    const extend = register(collection);

    return extend(new Hono<E>().get('/static/*', cached(cache_name)))

        .use(layout)

        .onError(exception)

        .get('/',

            csp({
                formAction: signing_nav ? [ signing_site ] : [],
            }),

            validator('query', parser(v_optional_signing_back)),

            async function (ctx) {

                const props = {
                    signing_nav,
                    signing_site,
                    action: '/?show=page',
                };

                const signed = ctx.req.valid('query');

                if (signed) {

                    const fp = await calc_fingerprint(signed.pub);

                    return ctx.render(

                        <Create { ...props } fingerprint={ fp }>

                            <SigningPane { ...signed } />

                        </Create>

                    );

                }

                return ctx.render(<Create { ...props } />);

            },

        )

        .post('/',

            insecure ? noop : csrf(),

            csp({ scriptSrc }),

            auth,

            validator('form', parser(v_create)),

            async function (ctx) {

                const { url: link, code } = ctx.req.valid('form');

                const slug = nmap(slugify, code);

                const id = slug ?? await hash(link);

                {

                    const { ttl = ttl_in_ms } = read_var(ctx.var);

                    const ok = await db.put(id, link, {
                        ttl: nmap(duration_in_milliseconds, ttl),
                    });

                    if ((ok === false) && slug) {
                        const message = `(${ slug }) already existed`;
                        throw new HTTPException(409, { message });
                    }

                }

                const { href } = new URL(`/go/${ id }`, ctx.req.url);

                if (ctx.req.query('show') === 'page') {

                    const { query } = v.parse(
                        v.partial(v.object({ query: v.string() })),
                        ctx.var,
                    );

                    return ctx.render(<Show { ...{ link, href, query } } />);

                }

                return ctx.text(href);

            },

        )

        .get('/go/:id', async function (ctx) {

            const id = ctx.req.param('id');

            const link = await db.get(id);

            if (link) {
                return ctx.redirect(link);
            }

            return ctx.notFound();

        })

        .post('/sign-on', async function (ctx) {

            const state = UUIDv4();
            const challenge = UUIDv4();

            setCookie(ctx, challenge_(state), challenge, {
                maxAge: 60 * 5, // 5 mins in second
                path: '/',
                secure: true,
                httpOnly: true,
                partitioned: true,
                sameSite: 'Strict',
            });

            const { origin, href } = new URL('/', ctx.req.url);

            const client_id = await UUIDv5_URL(origin);

            const signing_url = compose_signing_url({
                state,
                challenge,
                client_id,
                site: signing_site,
                redirect_uri: href,
                response_mode: 'query',
            });

            return ctx.redirect(signing_url);

        })

    ;

}

