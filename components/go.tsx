/** @jsx jsx */ void jsx;

import { css } from 'hono/css';
import { jsx, Fragment, memo } from 'hono/jsx';





export const Go = memo(function ({ open_in_new_page }: {

        open_in_new_page: boolean,

}) {

    const target = open_in_new_page ? '_blank' : '_self';

    return (<Fragment>

        <header>
            <div class="container">
                <nav>
                    <ul>
                        <li>
                            <a  class="outline"
                                role="button"
                                href="/"
                            >back</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>

        <main class={ style }>
            <div class="container">
                <article>

                    <form method="post" action="/go" target={ target }>

                        <fieldset role="group">

                            <input  name="id"
                                    type="text"
                                    inputmode="text"
                                    autocorrect="off"
                                    autocomplete="off"
                                    autocapitalize="off"
                                    required
                            />

                            <input class="contrast"
                                    type="submit"
                                    value="go"
                            />

                        </fieldset>
                    </form>

                    <footer>

                        open in ({ open_in_new_page

                            ? <span>
                                <a href="/go">
                                    <b>current</b>
                                </a> / <b x-select>new</b>
                            </span>

                            : <span>
                                <b x-select>
                                    current
                                </b> / <a href="/go?open=new">
                                    <b>new</b>
                                </a>
                            </span>

                        }) window

                    </footer>

                </article>
            </div>
        </main>

    </Fragment>);

});





export const style = css`

    max-width: 30em;
    margin: auto;

    & [x-select] {
        color: var(--pico-secondary);
    }

`;

