export default async function handler(request, response) {
    // Hanya ijinkan method GET
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    // Set header CORS agar browser mengizinkan respons dari function ini
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Jika preflight request (OPTIONS), return ok
    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    // Mengambil API key dari environment variables Vercel atau proses
    const API_KEY = process.env.VITE_NEWS_API_KEY;

    if (!API_KEY) {
        return response.status(500).json({ error: 'API key is missing in server environment variables' });
    }

    try {
        // Request ke GNews API dari sisi server (menghindari blokir CORS browser)
        const gnewsUrl = `https://gnews.io/api/v4/search?q=bencana OR gempa OR banjir OR tsunami OR erupsi&lang=id&country=id&topic=nation&apikey=${API_KEY}&max=10`;
        const apiResponse = await fetch(gnewsUrl);

        if (!apiResponse.ok) {
            throw new Error(`GNews API Error: ${apiResponse.statusText}`);
        }

        const data = await apiResponse.json();

        // Tambahkan header caching Vercel Network Edge (Vercel Cache) sebelum merespon (Maksimal 30 Menit)
        // Ini akan sangat menghemat GNews API. Ratusan pengguna tidak akan membuat ratusan request, melainkan 1 request per setengah jam!
        response.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');

        // Kirim respons kembali ke aplikasi React/Vite
        return response.status(200).json(data);
    } catch (error) {
        console.error('Fetch error:', error);
        return response.status(500).json({ error: 'Failed to fetch news data' });
    }
}
