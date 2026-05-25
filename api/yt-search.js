export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { q, type = 'video' } = request.query;

    if (!q) {
        return response.status(400).json({ error: 'Search query is required' });
    }

    // Set CORS headers so localhost can call this during dev
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    // Invidious instances (Server-to-server fetch avoids CORS issues)
    const SEARCH_INSTANCES = [
        'https://yewtu.be',
        'https://invidious.snopyta.org',
        'https://invidious.namu.blue',
        'https://inv.riverside.rocks',
        'https://invidious.sethforprivacy.com'
    ];

    for (const api of SEARCH_INSTANCES) {
        try {
            const ytUrl = `${api}/api/v1/search?q=${encodeURIComponent(q)}&type=${type}`;
            const apiResponse = await fetch(ytUrl);
            
            if (!apiResponse.ok) continue;

            const data = await apiResponse.json();
            
            // Format to a clean standardized JSON
            const results = data.map(item => ({
                videoId: item.videoId,
                title: item.title,
                artist: item.author,
                cover: item.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`,
                duration: item.lengthSeconds
            }));

            // Cache for 1 hour on the edge
            response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
            return response.status(200).json(results);
        } catch {
            console.warn(`Search failed on ${api}, trying next...`);
        }
    }

    return response.status(502).json({ error: 'All search instances are currently unavailable. Please try again in a few minutes.' });
}
