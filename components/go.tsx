/** @jsx jsx */ void jsx;

import { css } from 'hono/css';
import { jsx, Fragment, memo } from 'hono/jsx';





export const Go = memo(function () {

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
                    <form method="post" action="/go">

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
                </article>
            </div>
        </main>

    </Fragment>);

});





export const style = css`

    max-width: 30em;
    margin: auto;

`;

