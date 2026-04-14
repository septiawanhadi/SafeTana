/**
 * Service to handle environmental data fetching (Weather and Air Quality)
 */
export const envService = {
  /**
   * Fetch real-time weather and AQI with proxy fallbacks
   * @param {number} lat 
   * @param {number} lon 
   * @param {AbortSignal} signal 
   * @returns {Promise<{precipitation: number, aqi: string|number}>}
   */
  async fetchRealtimeEnv(lat, lon, signal) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

    const PROXIES = [
      '', 
      'https://api.allorigins.win/raw?url=',
      'https://thingproxy.freeboard.io/fetch/',
      'https://api.codetabs.com/v1/proxy?quest=',
      'https://corsproxy.io/?'
    ];

    for (const proxy of PROXIES) {
      if (signal?.aborted) throw new Error('AbortError');
      try {
        const fetchTarget = async (url) => {
          const finalUrl = proxy 
            ? proxy.includes('allorigins') ? `${proxy}${encodeURIComponent(url)}` : `${proxy}${url}`
            : url;

          const res = await fetch(finalUrl, { signal });
          if (!res.ok) throw new Error('Fetch failed');
          return await res.json();
        };

        const [wData, aData] = await Promise.all([
          fetchTarget(weatherUrl),
          fetchTarget(aqiUrl)
        ]);

        return {
          precipitation: wData.current?.precipitation ?? 0,
          aqi: aData.current?.us_aqi ?? '--'
        };
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        console.warn(`Env fetch failed via ${proxy || 'direct'}, trying next...`);
      }
    }

    return { precipitation: 0, aqi: '--' };
  }
};
