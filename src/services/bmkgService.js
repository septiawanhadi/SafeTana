// BMKG Data Service - Fetches weather, earthquake, and early warning data
// Internally uses BMKG's public APIs; no branding exposed to UI layer.

const BMKG_BASE = 'https://data.bmkg.go.id/DataMKG/TEWS';
const BMKG_WEATHER_API = 'https://api.bmkg.go.id/publik/prakiraan-cuaca';
const OPEN_METEO_AQI = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// Bandung City (Sukasari district) ADM4 code for BMKG
const BANDUNG_ADM4 = '32.73.01.1003';
const BANDUNG_LAT = -6.9175;
const BANDUNG_LON = 107.6191;

// Helper: translate weather code to Indonesian label + icon emoji
export function getWeatherInfo(code) {
  const map = {
    0: { label: 'Cerah', emoji: '☀️', severity: 'safe' },
    1: { label: 'Cerah', emoji: '🌤️', severity: 'safe' },
    2: { label: 'Cerah Berawan', emoji: '⛅', severity: 'safe' },
    3: { label: 'Berawan', emoji: '☁️', severity: 'safe' },
    45: { label: 'Berkabut', emoji: '🌫️', severity: 'watch' },
    48: { label: 'Berkabut Tebal', emoji: '🌫️', severity: 'watch' },
    51: { label: 'Gerimis', emoji: '🌦️', severity: 'watch' },
    53: { label: 'Gerimis Sedang', emoji: '🌦️', severity: 'watch' },
    55: { label: 'Gerimis Lebat', emoji: '🌧️', severity: 'warning' },
    61: { label: 'Hujan Ringan', emoji: '🌧️', severity: 'watch' },
    63: { label: 'Hujan Sedang', emoji: '🌧️', severity: 'warning' },
    65: { label: 'Hujan Lebat', emoji: '⛈️', severity: 'warning' },
    80: { label: 'Hujan Lokal', emoji: '🌦️', severity: 'watch' },
    95: { label: 'Hujan Petir', emoji: '⛈️', severity: 'danger' },
    99: { label: 'Hujan Petir Lebat', emoji: '🌩️', severity: 'danger' },
  };
  // BMKG weather codes (1–3 = cerah, 4 = berawan)
  if (code === 1) return { label: 'Cerah', emoji: '☀️', severity: 'safe' };
  if (code === 2) return { label: 'Cerah Berawan', emoji: '⛅', severity: 'safe' };
  if (code === 3) return { label: 'Berawan', emoji: '☁️', severity: 'safe' };
  if (code === 4) return { label: 'Berawan Tebal', emoji: '🌥️', severity: 'safe' };
  if (code === 5) return { label: 'Udara Kabur', emoji: '🌫️', severity: 'watch' };
  if (code === 10) return { label: 'Asap', emoji: '🌫️', severity: 'warning' };
  if (code === 45) return { label: 'Berkabut', emoji: '🌫️', severity: 'watch' };
  if (code === 60) return { label: 'Hujan Ringan', emoji: '🌦️', severity: 'watch' };
  if (code === 61) return { label: 'Hujan Ringan', emoji: '🌧️', severity: 'watch' };
  if (code === 63) return { label: 'Hujan Sedang', emoji: '🌧️', severity: 'warning' };
  if (code === 65) return { label: 'Hujan Lebat', emoji: '⛈️', severity: 'warning' };
  if (code === 80) return { label: 'Hujan Lokal', emoji: '🌦️', severity: 'watch' };
  if (code === 95) return { label: 'Hujan Petir', emoji: '⛈️', severity: 'danger' };
  if (code === 97) return { label: 'Hujan Petir Lebat', emoji: '🌩️', severity: 'danger' };
  return map[code] || { label: 'Tidak Diketahui', emoji: '❓', severity: 'safe' };
}

// Get AQI category label and color
export function getAqiInfo(aqi) {
  if (aqi === null || aqi === undefined || aqi === '--') return { label: 'N/A', color: 'text-slate-400', bg: 'bg-slate-400/10' };
  const n = Number(aqi);
  if (n <= 50) return { label: 'Baik', color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: 'Kualitas udara memuaskan' };
  if (n <= 100) return { label: 'Sedang', color: 'text-yellow-400', bg: 'bg-yellow-400/10', desc: 'Dapat diterima penggunaan normal' };
  if (n <= 150) return { label: 'Tidak Sehat\n(Kelompok Sensitif)', color: 'text-orange-400', bg: 'bg-orange-400/10', desc: 'Sensitif terhadap polusi udara' };
  if (n <= 200) return { label: 'Tidak Sehat', color: 'text-red-400', bg: 'bg-red-400/10', desc: 'Semua orang berpotensi terdampak' };
  if (n <= 300) return { label: 'Sangat Tidak Sehat', color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Kondisi darurat kesehatan mungkin terjadi' };
  return { label: 'Berbahaya', color: 'text-rose-400', bg: 'bg-rose-400/10', desc: 'Kondisi darurat kesehatan serius' };
}

// Wind direction to compass label
export function windDirLabel(deg) {
  const dirs = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
  return dirs[Math.round(deg / 45) % 8];
}

/**
 * Fetch the latest single earthquake from BMKG
 */
export async function fetchLatestEarthquake(signal) {
  const res = await fetch(`${BMKG_BASE}/autogempa.json`, { signal });
  if (!res.ok) throw new Error('Gagal mengambil data gempa terbaru');
  const data = await res.json();
  return data.Infogempa.gempa;
}

/**
 * Fetch list of felt earthquakes (last 15)
 */
export async function fetchFeltEarthquakes(signal) {
  const res = await fetch(`${BMKG_BASE}/gempadirasakan.json`, { signal });
  if (!res.ok) throw new Error('Gagal mengambil daftar gempa');
  const data = await res.json();
  return data.Infogempa.gempa.slice(0, 8);
}

/**
 * Fetch Bandung weather forecast from BMKG
 * Returns today's & upcoming forecast data
 */
export async function fetchBandungWeather(signal) {
  const res = await fetch(`${BMKG_WEATHER_API}?adm4=${BANDUNG_ADM4}`, { signal });
  if (!res.ok) throw new Error('Gagal mengambil prakiraan cuaca Bandung');
  const data = await res.json();
  const lokasi = data.lokasi;
  // data.data[0].cuaca is an array of day groups, each being an array of hourly forecasts
  const allHours = data.data[0].cuaca.flat();
  return { lokasi, forecasts: allHours };
}

/**
 * Fetch AQI for Bandung from Open-Meteo
 */
export async function fetchBandungAqi(signal) {
  try {
    const url = `${OPEN_METEO_AQI}?latitude=${BANDUNG_LAT}&longitude=${BANDUNG_LON}&current=us_aqi,pm2_5,pm10&hourly=us_aqi`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('AQI fetch failed');
    const data = await res.json();
    return {
      aqi: data.current?.us_aqi ?? '--',
      pm25: data.current?.pm2_5 ?? '--',
      pm10: data.current?.pm10 ?? '--',
    };
  } catch {
    return { aqi: '--', pm25: '--', pm10: '--' };
  }
}

/**
 * Derive early warnings from forecast data
 * Returns array of warning objects: { level, title, description, area }
 */
export function deriveEarlyWarnings(forecasts) {
  const warnings = [];
  const dangerHours = forecasts.filter(f => f.weather === 95 || f.weather === 97);
  const heavyRainHours = forecasts.filter(f => f.weather === 65 || f.weather === 63);
  const fogHours = forecasts.filter(f => f.weather === 45 || f.weather === 5);

  if (dangerHours.length > 0) {
    const firstTime = new Date(dangerHours[0].local_datetime || dangerHours[0].datetime);
    warnings.push({
      level: 'danger',
      icon: '⛈️',
      title: 'Waspada Hujan Lebat Disertai Petir',
      description: `Berpotensi terjadi hujan lebat disertai petir dan angin kencang. Segera cari tempat berlindung.`,
      time: firstTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    });
  } else if (heavyRainHours.length > 0) {
    const firstTime = new Date(heavyRainHours[0].local_datetime || heavyRainHours[0].datetime);
    warnings.push({
      level: 'warning',
      icon: '🌧️',
      title: 'Potensi Hujan Sedang–Lebat',
      description: `Diperkirakan terjadi hujan sedang hingga lebat dalam beberapa jam ke depan. Waspadai genangan air.`,
      time: firstTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    });
  }

  if (fogHours.length > 2) {
    warnings.push({
      level: 'watch',
      icon: '🌫️',
      title: 'Potensi Kabut',
      description: 'Visibilitas rendah akibat kabut. Berhati-hati saat berkendara.',
      time: null,
    });
  }

  return warnings;
}

export { BANDUNG_LAT, BANDUNG_LON };
