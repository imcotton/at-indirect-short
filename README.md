# jsr:@indirect/short

[![jsr](https://jsr.io/badges/@indirect/short)](https://jsr.io/@indirect/short)
[![codecov](https://codecov.io/gh/imcotton/at-indirect-short/graph/badge.svg)](https://codecov.io/gh/imcotton/at-indirect-short)

> Web App for URL Shortener





<br><br><br><br><br>
## Interface <sup>_(curl)_</sup>

- create `url`

    ```sh
    curl localhost:3000 -F "url=https://example.net"
    ```

- create with specified slug (`code`)

    ```sh
    curl localhost:3000 -F "url=https://example.net" \
                        -F "code=foobar"
    ```

- **/go/**

    ```sh
    curl -i localhost:3000/go/foobar
    ```





<br><br><br><br><br>
## Examples (on Deno Deploy)

- no auth, one liner

    ```js
    export { default } from 'jsr:@indirect/short@1'
    ```

- **signing auth** (via: https://sign-poc.js.org)

    ```js
    import { make }        from 'jsr:@indirect/short@1/deploy/deno'
    import { signingAuth } from 'jsr:@indirect/short@1/helper'

    export default await make({

        auth: signingAuth([
            // public key fingerprint - SHA256:xxxxxx
        ]),

    })
    ```

- **basic auth** (by: https://hono.dev/docs/middleware/builtin/basic-auth)

    ```js
    import { make }      from 'jsr:@indirect/short@1/deploy/deno'
    import { basicAuth } from 'jsr:@indirect/short@1/helper'

    export default await make({

        auth: basicAuth({ username: 'admin', password: 'Y0LO' }),

    })
    ```

- **bearer auth** (by: https://hono.dev/docs/middleware/builtin/bearer-auth)

    ```js
    import { make }       from 'jsr:@indirect/short@1/deploy/deno'
    import { bearerAuth } from 'jsr:@indirect/short@1/helper'

    export default await make({

        auth: bearerAuth({ token: 'foobar' }),

    })
    ```





<br><br><br><br><br>
## License

**AGPLv3**

