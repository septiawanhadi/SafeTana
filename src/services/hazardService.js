import { reverseGeocode } from '../utils/geoUtils';
import { maskName } from '../securityUtils';

const BANDUNG_COORDS = { lat: -6.9147, lon: 107.6098, radius: 30000 };

/**
 * Service to handle fetching and processing hazard data from multiple sources
 */
export const hazardService = {
  /**
   * Fetch hazard reports from BMKG, PetaBencana, and GDACS
   * @param {AbortSignal} signal 
   * @returns {Promise<Array>}
   */
  async fetchAllHazards(signal) {
    const cachedReports = localStorage.getItem('safetana_reports_cache');
    const lastFetchTime = localStorage.getItem('safetana_last_fetch_time');
    const now = new Date().getTime();

    // Return cache if it's fresh (less than 5 minutes)
    if (cachedReports && lastFetchTime && (now - parseInt(lastFetchTime, 10)) < 300000) {
      try {
        return JSON.parse(cachedReports).filter(r => r.source !== 'Dummy System');
      } catch (e) {
        console.error("Gagal membaca cache:", e);
      }
    }

    try {
      // 1. Fetch BMKG Earthquake Data (Latest, M 5.0+, Felt)
      const bmkgEndpoints = [
        'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json',
        'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json',
        'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json'
      ];

      const bmkgResults = await Promise.allSettled(
        bmkgEndpoints.map(url => fetch(url, { signal }).then(r => r.json()))
      );

      const quakeMap = new Map();
      bmkgResults.forEach(res => {
        if (res.status === 'fulfilled' && res.value?.Infogempa?.gempa) {
          const raw = res.value.Infogempa.gempa;
          const quakes = Array.isArray(raw) ? raw : [raw];
          
          quakes.forEach(item => {
            const key = `${item.Tanggal}-${item.Jam}-${item.Coordinates}`;
            if (!quakeMap.has(key)) {
              quakeMap.set(key, {
                source: 'BMKG',
                type: `Gempa M ${item.Magnitude}`,
                loc: item.Wilayah,
                position: item.Coordinates.split(',').map(Number),
                desc: `Skala MMI: ${item.Dirasakan || '—'} · Kedalaman: ${item.Kedalaman}${item.Potensi ? ' · ' + item.Potensi : ''}`,
                depth: item.Kedalaman,
                time: `${item.Tanggal} ${item.Jam}`,
                shakemap: item.Shakemap || null,
                statusColor: 'bg-error'
              });
            }
          });
        }
      });
      const bmkg = Array.from(quakeMap.values());

      // 2. Fetch PetaBencana API
      let petabencana = [];
      try {
        const resPB = await fetch('https://data.petabencana.id/reports?timeperiod=604800', { signal });
        const dataPB = await resPB.json();

        if (dataPB?.result?.features) {
          petabencana = dataPB.result.features.slice(0, 15).map(feature => {
            const props = feature.properties;
            const typeRaw = props.hazard_type || 'unknown';

            let typeMap = 'Bencana Bantuan', colorMap = 'bg-tertiary';
            if (typeRaw === 'flood') { typeMap = 'Banjir'; colorMap = 'bg-primary'; }
            else if (typeRaw === 'earthquake') { typeMap = 'Gempa Bumi'; colorMap = 'bg-error'; }
            else if (typeRaw === 'wind') { typeMap = 'Angin Kencang'; colorMap = 'bg-surface-variant'; }
            else if (typeRaw === 'volcano') { typeMap = 'Gunung Api'; colorMap = 'bg-error-container'; }
            else if (typeRaw === 'fire') { typeMap = 'Kebakaran'; colorMap = 'bg-error'; }
            else if (typeRaw === 'haze') { typeMap = 'Kabut Asap'; colorMap = 'bg-outline'; }

            let locName = props.tags?.district || props.tags?.local_area || 'Wilayah Terdampak';
            const coords = feature.geometry.coordinates;
            let mapLat = 0, mapLng = 0;
            if (feature.geometry.type === 'Point') {
               mapLat = coords[1]; mapLng = coords[0];
            } else {
               const flatten = (arr) => Array.isArray(arr[0]) ? flatten(arr[0]) : arr;
               const pt = flatten(coords);
               if (pt?.length >= 2) { mapLat = pt[1]; mapLng = pt[0]; }
            }

            return {
              source: 'PetaBencana',
              type: typeMap,
              loc: maskName(locName),
              position: [mapLat, mapLng],
              desc: maskName(props.tags?.description) || `Status: ${props.status} / Publik`,
              statusColor: colorMap
            };
          });
        }
      } catch (pbError) {
        if (pbError.name !== 'AbortError') console.warn("Gagal mengambil data PetaBencana:", pbError);
      }

      // 3. Fetch GDACS API
      let gdacsData = [];
      try {
        const resGDACS = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP', { signal });
        const dataGDACS = await resGDACS.json();
        if (dataGDACS?.features) {
          const idnEvents = dataGDACS.features.filter(f =>
            f.properties?.country?.toLowerCase().includes('indonesia')
          );

          gdacsData = await Promise.all(idnEvents.map(async feature => {
            const props = feature.properties;
            const coords = feature.geometry.coordinates;
            let mapLat = 0, mapLng = 0;
            if (feature.geometry.type === 'Point') {
               mapLat = coords[1]; mapLng = coords[0];
            } else {
               const flatten = (arr) => Array.isArray(arr[0]) ? flatten(arr[0]) : arr;
               const pt = flatten(coords);
               if (pt?.length >= 2) { mapLat = pt[1]; mapLng = pt[0]; }
            }

            let typeMap = props.eventtype || 'EVENT';
            if (props.eventtype === 'EQ') typeMap = 'Gempa Bumi';
            else if (props.eventtype === 'TC') typeMap = 'Siklon Tropis';
            else if (props.eventtype === 'FL') typeMap = 'Banjir';
            else if (props.eventtype === 'VO') typeMap = 'Gunung Api';
            else if (props.eventtype === 'DR') typeMap = 'Kekeringan';
            else if (props.eventtype === 'WF') typeMap = 'Kebakaran Hutan';

            let colorMap = 'bg-surface-variant';
            if (props.alertlevel === 'Red') colorMap = 'bg-error';
            else if (props.alertlevel === 'Orange') colorMap = 'bg-error-container';
            else if (props.alertlevel === 'Green') colorMap = 'bg-success';

            let rawLoc = props.eventname || props.country;
            if ((!rawLoc || rawLoc.trim().toLowerCase() === 'indonesia') && mapLat !== 0) {
              const geoLoc = await reverseGeocode(mapLat, mapLng);
              rawLoc = geoLoc || 'Wilayah Terdampak (GDACS)';
            }

            return {
              source: 'GDACS',
              type: typeMap,
              loc: maskName(rawLoc),
              position: [mapLat, mapLng],
              desc: maskName(props.description) || `Alert Level: ${props.alertlevel}`,
              statusColor: colorMap
            };
          }));
        }
      } catch (gdacsError) {
        if (gdacsError.name !== 'AbortError') console.warn("Gagal mengambil data GDACS:", gdacsError);
      }

      const combinedReports = [...bmkg, ...petabencana, ...gdacsData].filter(r => r.source !== 'Dummy System');
      
      // Update Cache
      localStorage.setItem('safetana_reports_cache', JSON.stringify(combinedReports));
      localStorage.setItem('safetana_last_fetch_time', now.toString());

      return combinedReports;
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      console.error("hazardService fetch error:", e);
      
      // Fallback data if everything fails and no cache
      if (!cachedReports) {
        return [
          {
            source: 'BPBD Jabar', type: 'Tanah Longsor', loc: 'Kec. Cililin, Kabupaten Bandung Barat',
            position: [-6.95, 107.46], desc: 'Jalan terputus, 15 KK dievakuasi',
            statusColor: 'bg-emerald-500'
          },
          {
             source: 'BMKG', type: 'Gempa M 5.2', loc: 'Kabupaten Bandung',
             position: [-7.16, 107.45], desc: 'Skala MMI: III',
             statusColor: 'bg-error'
          }
        ];
      }
      return JSON.parse(cachedReports);
    }
  },

  /**
   * Fetch specific flood reports for local area from PetaBencana
   */
  async fetchLocalFloods(lat, lon, signal) {
    try {
      const url = `https://data.petabencana.id/reports?lat=${lat}&lon=${lon}&radius=30000`;
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error('Failed to fetch local disasters');
      
      const data = await res.json();
      if (!data?.result?.features) return [];

      return data.result.features.map(f => {
        const p = f.properties;
        const coords = f.geometry.coordinates;
        
        let typeMap = 'Bencana Lain', colorMap = 'bg-tertiary';
        if (p.hazard_type === 'flood') { typeMap = 'Banjir'; colorMap = 'bg-primary'; }
        else if (p.hazard_type === 'wind') { typeMap = 'Angin Kencang'; colorMap = 'bg-surface-variant'; }
        else if (p.hazard_type === 'earthquake') { typeMap = 'Gempa Bumi'; colorMap = 'bg-error'; }
        
        return {
          id: p.report_id,
          source: 'PetaBencana.id',
          type: typeMap,
          title: p.title || `Laporan ${typeMap}`,
          loc: p.tags?.district || p.tags?.local_area || 'Wilayah Terdampak',
          position: f.geometry.type === 'Point' ? [coords[1], coords[0]] : [coords[0][1], coords[0][0]],
          desc: p.tags?.description || `Status: ${p.status}`,
          severity: p.tags?.instance_status || 'normal',
          time: new Date(p.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
          statusColor: colorMap,
          url: `https://petabencana.id/report/${p.report_id}`
        };
      });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Error fetching local floods:', err);
      return [];
    }
  }
};
