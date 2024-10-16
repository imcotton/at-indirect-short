/** @jsx jsx */ void jsx;

import { Style } from 'hono/css';
import { jsx } from 'hono/jsx';
import { jsxRenderer } from 'hono/jsx-renderer';

import { pico_css } from '../assets.ts';

export { SigningPane } from './signing-pane.tsx';
export { Create } from './create.tsx';
export { Show } from './show.tsx';





export const layout = jsxRenderer(({ children }) => <html>

    <head>

        <meta charset="utf-8" />

        <title>URL Shortener</title>

        <meta   name="viewport"
                content="width=device-width, initial-scale=1"
        />

        <link   rel="stylesheet"
                href={ pico_css.href }
                integrity={ pico_css.integrity }
        />

        <Style />

    </head>

    <body>
        { children }
    </body>

</html>);

