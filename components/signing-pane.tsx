/** @jsx jsx */ void jsx;

import { jsx } from 'hono/jsx';
import { css } from 'hono/css';





export function SigningPane ({ pub, state, timestamp, signature }: {

        pub: string,
        state: string,
        timestamp: string,
        signature: string,

}) {

    return (<details class={ style }>

        <summary role="button" class="outline secondary">
            <i>signing info...</i>
        </summary>

        <ul x-more>

            <li>
                <strong>timestamp:</strong> <code>{ timestamp }</code>
                <input type="hidden" name="timestamp" value={ timestamp } />
            </li>

            <li>
                <strong>state:</strong> <code>{ state }</code>
                <input type="hidden" name="state" value={ state } />
            </li>

            <li>
                <strong>public key:</strong> <code>{ pub }</code>
                <input type="hidden" name="pub" value={ pub } />
            </li>

            <li>
                <strong>signature:</strong> <code>{ signature }</code>
                <input type="hidden" name="signature" value={ signature } />
            </li>

        </ul>

    </details>);

}





const style = css`

    & [x-more] {
        & li > code {
            display: block;
        }
    }

`;

