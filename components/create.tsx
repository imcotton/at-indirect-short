/** @jsx jsx */ void jsx;

import { css } from 'hono/css';
import { jsx, Fragment, type PropsWithChildren } from 'hono/jsx';





export function Create ({

        action, signing_nav, signing_site, fingerprint, children

}: PropsWithChildren<{

        action: string,
        signing_nav: boolean,
        signing_site: string,
        fingerprint?: string,

}>) {

    const { host: signing_host } = new URL(signing_site);

    return (<Fragment>

        <header class={ style.header }>
            <div class="container">

                { signing_nav && <nav>

                    <ul>
                        <li>
                            { fingerprint

                                ? <a    href="/"
                                        role="button"
                                        class="secondary"
                                >Sign Out</a>

                                : <form action="/sign-on" method="post">

                                    <input  class="outline"
                                            type="submit"
                                            value="Sign On"
                                    />

                                </form>
                            }
                        </li>

                        { fingerprint == null && <li>

                            <span>

                                <sub>via</sub> <a
                                    class="underline"
                                    target="_blank"
                                    href={ signing_site }
                                ><u>{ signing_host }</u></a>

                            </span>

                        </li> }

                    </ul>

                </nav> }

            </div>
        </header>

        <main class={ style.main }>
            <div class="container">

                <h1 class="center">URL Shortener</h1>

                <form method="post" action={ action }>

                    <article>

                        <input  name="url"
                                type="url"
                                inputmode="url"
                                placeholder="https://"
                                required
                        />

                        <fieldset role="group">

                            <input  name="code"
                                    type="text"
                                    inputmode="text"
                                    placeholder="(optional slug)"
                            />

                            <input type="submit" value="Create" />

                        </fieldset>

                        { children && <footer>

                            <section class="end" x-fp>
                                <code class="wrap">{ fingerprint }</code>
                            </section>

                            { children }

                        </footer> }

                    </article>

                </form>

            </div>
        </main>

        <footer class={ style.footer }>
            <div class="container">

                open source <a
                    role="button"
                    class="outline contrast"
                    target="_blank"
                    href="https://jsr.io/@indirect/short"
                ><strong>jsr:@indirect/short</strong></a>

            </div>
        </footer>

    </Fragment>);

}





const style = {

    header: css`

        & .underline {
            text-underline-position: under;
        }

    `,

    main: css`

        & .center {
            text-align: center;
        }

        & .end {
            text-align: end;
        }

        & code.wrap {
            word-break: break-all;
            border: 1px solid var(--pico-form-element-valid-active-border-color);
        }

        & [x-fp]:not(:has(code:empty)):before {
            content: 'fingerprint: ';
            font-weight: bold;
        }

    `,

    footer: css`

        & {
            text-align: center;
            padding-top: 3rem;
            padding-bottom: 2rem;
        }

    `,

}

