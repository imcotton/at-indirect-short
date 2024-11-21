import { encodeBase58 } from '@std/encoding/base58';
import { crypto as std_crypto } from '@std/crypto/crypto';

import type { Encoder } from './index.ts';

import { HMAC_SHA256 } from '../utils.ts';





export function gen_fnv1a_hash ({

        key = `Cool URIs Don't Change`,
        large = false,

} = {}): Encoder {

    return async function (message) {

        const entropy = await HMAC_SHA256({ key, message });

        const algo = large ? 'FNV64A' : 'FNV32A';

        const hash = await std_crypto.subtle.digest(algo, entropy);

        return encodeBase58(hash);

    };

}

