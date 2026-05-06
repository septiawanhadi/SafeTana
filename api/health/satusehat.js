/**
 * Vercel Serverless Function: SatuSehat API Proxy
 * Handles OAuth 2.0 Client Credentials flow and proxies requests to SatuSehat FHIR API.
 */

const AUTH_URL = process.env.VITE_SATUSEHAT_AUTH_URL;
const BASE_URL = process.env.VITE_SATUSEHAT_BASE_URL;
const CLIENT_ID = process.env.VITE_SATUSEHAT_CLIENT_ID;
const CLIENT_SECRET = process.env.VITE_SATUSEHAT_CLIENT_SECRET;

// In-memory token cache (limited to the lifecycle of the serverless instance)
let tokenCache = {
    token: null,
    expiresAt: 0
};

/**
 * Get OAuth Access Token from SatuSehat
 */
async function getAccessToken() {
    const now = Date.now();
    if (tokenCache.token && tokenCache.expiresAt > now + 60000) {
        return tokenCache.token;
    }

    console.log("Fetching new SatuSehat Access Token...");
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("SatuSehat Auth Error:", err);
        throw new Error("Failed to authenticate with SatuSehat");
    }

    const data = await response.json();
    tokenCache = {
        token: data.access_token,
        expiresAt: now + (data.expires_in * 1000)
    };
    return data.access_token;
}

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { path, ...query } = req.query;
    if (!path) {
        return res.status(400).json({ error: 'Missing path parameter' });
    }

    try {
        const token = await getAccessToken();
        
        // Construct full URL with original query params
        const queryString = new URLSearchParams(query).toString();
        let url = '';
        
        // Handle masterdata endpoint which has a different base URL structure
        if (path.startsWith('masterdata/')) {
            const domainOnly = BASE_URL.replace('/fhir-r4/v1', '');
            url = `${domainOnly}/${path}${queryString ? '?' + queryString : ''}`;
        } else {
            url = `${BASE_URL}/${path}${queryString ? '?' + queryString : ''}`;
        }

        console.log(`Proxying request to SatuSehat: ${url}`);

        const response = await fetch(url, {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: req.method === 'POST' ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error("SatuSehat Proxy Error:", error);
        return res.status(500).json({ 
            error: 'SatuSehat Integration Error', 
            details: error.message,
            mock: true // Indication for UI that this might be a configuration issue
        });
    }
}
