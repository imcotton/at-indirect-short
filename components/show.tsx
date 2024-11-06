/** @jsx jsx */ void jsx;

import { css } from 'hono/css';
import { raw } from 'hono/html';
import { jsx } from 'hono/jsx';

import { qrcode } from '@libs/qrcode';

import { calc_integrity, map_quotes } from '../utils.ts';





export function Show ({ link, href, session }: {

        link: string,
        href: string,
        session?: string,

}) {

    const svg = qrcode(href, { output: 'svg', border: 2 });

    const back = session ? `/?${ session }` : '/';

    return (<main class="container">

        <article class={ style }>

            <header>
                <a href={ link } target="_blank" ref="noreferrer noopener">
                    { link }
                </a>
            </header>

            <figure>
                { raw(svg) }
            </figure>

            <fieldset>

                <input  type="url"
                        value={ href }
                        readonly
                />

                <button type="button"
                        data-href={ href }
                        onclick={ use_client }
                >copy</button>

            </fieldset>

            <footer>
                <a href={ back } role="button" class="secondary outline">back</a>
            </footer>

        </article>

    </main>);

}





const use_client: string = `

    navigator.clipboard.writeText(this.dataset.href)

`.trim();

export const integrity = await calc_integrity(use_client);

export const scriptSrc = map_quotes([ 'unsafe-hashes', integrity ]);





const style = css`

    max-width: 30em;
    margin: auto;
    margin-top: 2em;

    & svg {
        width: 100%;
        max-width: 15em;
    }

    & footer {
        text-align: right;
    }

`;

