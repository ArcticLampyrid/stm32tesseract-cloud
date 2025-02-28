import { decodeBase64Url, encodeBase64Url } from 'hono/utils/encode';

interface PowVerifyResult {
    valid: boolean;
    message?: string;
}

const generatePoWPrefix = async (key: string, resId: string): Promise<string> => {
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(key),
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"]
    );

    const timestamp = Math.floor(Date.now() / 1000);
    const timestampBytes = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
        timestampBytes[i] = (timestamp >> (i * 8)) & 0xff;
    }

    const uuid = new Uint8Array(16);
    crypto.getRandomValues(uuid);

    const resIdBytes = new TextEncoder().encode(resId);

    const dataToSign = new Uint8Array(8 + 16 + resIdBytes.length);
    // timestamp (8 bytes) + uuid (16 bytes) + resId (variable length)
    dataToSign.set(timestampBytes, 0);
    dataToSign.set(uuid, 8);
    dataToSign.set(resIdBytes, 24);

    const mac = await crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        dataToSign
    );

    const combined = new Uint8Array(1 + 8 + 16 + 20);
    // version (1 byte) + timestamp (8 bytes) + uuid (16 bytes) + mac (20 bytes)
    combined[0] = 1;
    combined.set(timestampBytes, 1);
    combined.set(uuid, 9);
    combined.set(new Uint8Array(mac), 25);

    return encodeBase64Url(combined.buffer) + '$';
};

const verifyPoW = async (key: string, difficulty: number, resId: string, computed: string, replayNamespace: KVNamespace): Promise<PowVerifyResult> => {
    // Check PoW
    const sha1Hash = new Uint8Array(await crypto.subtle.digest("SHA-1", new TextEncoder().encode(computed)));
    const prefix_bytes = difficulty >> 3;
    const prefix_bits = difficulty & 0x7;
    for (let i = 0; i < prefix_bytes; i++) {
        if (sha1Hash[i] !== 0) {
            return { valid: false, message: 'PoW failed' };
        }
    }
    if (prefix_bits > 0) {
        const mask = (1 << (8 - prefix_bits)) - 1;
        if ((sha1Hash[prefix_bytes] & mask) !== 0) {
            return { valid: false, message: 'PoW failed' };
        }
    }

    // Check HMAC signature
    const [combinedDataBase64] = computed.split('$', 1);
    const combinedData = decodeBase64Url(combinedDataBase64);
    if (combinedData[0] !== 1) {
        return { valid: false, message: 'PoW signature version unsupported' };
    }
    const resIdBytes = new TextEncoder().encode(resId);
    const dataToSign = new Uint8Array(8 + 16 + resIdBytes.length);
    dataToSign.set(combinedData.slice(1, 25), 0);
    dataToSign.set(resIdBytes, 24);
    const macData = combinedData.slice(25);
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(key),
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["verify"]
    );
    const verified = await crypto.subtle.verify(
        "HMAC",
        cryptoKey,
        macData,
        dataToSign,
    );
    if (!verified) {
        return { valid: false, message: 'PoW signature invalid' };
    }

    // Check timestamp
    const timestamp = new DataView(combinedData.buffer).getBigUint64(1, false);
    const timestampNow = BigInt(Math.floor(Date.now() / 1000));
    if (timestamp + BigInt(3600) /* 1 hour */ < timestampNow) {
        return { valid: false, message: 'PoW expired' };
    }

    // Check uuid, prevent replay attack
    const uuid = new Uint8Array(combinedData.buffer.slice(9, 25));
    const uuidHex = Array.from(uuid).map(b => b.toString(16).padStart(2, '0')).join('');
    const usedTimes = Number.parseInt(await replayNamespace.get(uuidHex) || '0', 10);
    if (usedTimes > 10) {
        return { valid: false, message: 'PoW replayed too many times' };
    }
    await replayNamespace.put(uuidHex, (usedTimes + 1).toString(), {
        expirationTtl: 3600 + 60 /* 1 hour + 1 minute */
    });

    return { valid: true };
}

export { generatePoWPrefix, verifyPoW };