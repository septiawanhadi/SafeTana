import crypto from 'crypto';
import LZString from 'lz-string';

/**
 * Vercel Serverless Function: BPJS VClaim Proxy
 * Handles Signature Generation, Decryption, and Decompression for BPJS VClaim v2.0
 */

const CONS_ID = process.env.VITE_BPJS_CONS_ID;
const SECRET_KEY = process.env.VITE_BPJS_SECRET_KEY;
const USER_KEY = process.env.VITE_BPJS_USER_KEY;
const BASE_URL = process.env.VITE_BPJS_BASE_URL;

/**
 * Decrypt BPJS Response
 */
function decrypt(encryptedData, timestamp) {
    try {
        const keyString = CONS_ID + SECRET_KEY + timestamp;
        const hash = crypto.createHash('sha256').update(keyString).digest();
        const key = hash; // 32 bytes for AES-256
        const iv = hash.slice(0, 16); // First 16 bytes for IV

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        
        // Decompress using LZString
        return LZString.decompressFromEncodedURIComponent(decrypted);
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Gagal mendekripsi data dari BPJS");
    }
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { path } = req.query;
    if (!path) {
        return res.status(400).json({ error: 'Missing path parameter' });
    }

    if (!CONS_ID || !SECRET_KEY || !USER_KEY) {
        return res.status(500).json({ 
            error: 'BPJS Configuration missing',
            mock: true // UI can use this to show "Not Configured"
        });
    }

    try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const data = CONS_ID + "&" + timestamp;
        const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64');

        const url = `${BASE_URL}/${path}`;
        console.log(`Proxying request to BPJS: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-cons-id': CONS_ID,
                'X-timestamp': timestamp,
                'X-signature': signature,
                'user_key': USER_KEY,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        // BPJS v2.0 responses are encrypted in the 'response' field
        if (result.metaData.code === "200" && typeof result.response === 'string') {
            const decryptedData = decrypt(result.response, timestamp);
            return res.status(200).json({
                metaData: result.metaData,
                response: JSON.parse(decryptedData)
            });
        }

        return res.status(response.status).json(result);
    } catch (error) {
        console.error("BPJS Proxy Error:", error);
        return res.status(500).json({ 
            error: 'BPJS Integration Error', 
            details: error.message 
        });
    }
}
