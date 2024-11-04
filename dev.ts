import { make } from './deploy/deno.ts';
import { signingAuth } from './helper.ts';
import { mins } from './utils.ts';





const app: Deno.ServeDefaultExport = await make({

    kv_path: './db/kv',

    signing_nav: true,

    ttl_in_ms: mins(60), // 1 hour

    auth: signingAuth([

        /**
         *  This fingerprint is for local dev only: http://localhost:3000
         *
         *    username: dev
         *    password: correct horse battery staple
         */

        'SHA256:Vc1gNX/Ao5jE493T5aIfiKXZnXFdHI/AOuFxeFGkzjQ',

    ]),

});

export default app;

