import { decodeHex } from '@std/encoding/hex';
import { encodeBase58 } from '@std/encoding/base58';

import fnv1a from 'fnv1a';

import type { Encoder } from './index.ts';

import { HMAC_SHA256 } from '../utils.ts';





export function gen_fnv1a_hash ({

        key = `Cool URIs Don't Change`,
        large = false,

} = {}): Encoder {

    return async function (message) {

        const entropy = await HMAC_SHA256({ key, message });

        const size = large ? 64 : 32;

        const bn = fnv1a(new Uint8Array(entropy), { size });
        const hash = decodeHex(bn.toString(16));

        return encodeBase58(hash);

    };

}

