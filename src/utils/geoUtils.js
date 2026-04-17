export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius bumi dalam kilometer
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Hasil dalam km
};

export const reverseGeocode = async (lat, lon) => {
    try {
        const cleanLat = Number(lat).toFixed(6);
        const cleanLon = Number(lon).toFixed(6);
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${cleanLat}&longitude=${cleanLon}&localityLanguage=en`);
        if (!res.ok) return null;
        const data = await res.json();
        // Priority: locality (e.g., district/village), then city/regency, then subdivision (province)
        const parts = [];
        if (data.locality) parts.push(data.locality);
        if (data.city) parts.push(data.city);
        if (data.principalSubdivision) parts.push(data.principalSubdivision);

        if (parts.length > 0) {
            // Unikkan elemen untuk menghindari "Kabupaten Temanggung, Kabupaten Temanggung"
            const uniqueParts = [...new Set(parts)];
            return uniqueParts.join(', ');
        }
    } catch (e) {
        console.warn('Geocode error:', e);
    }
    return null;
};
