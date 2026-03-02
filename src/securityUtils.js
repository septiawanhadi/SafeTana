// Simple Utility for Encrypting/Decrypting Coordinates and Masking PII
// Catatan: Ini adalah contoh sederhana untuk demonstrasi. 
// Di production sungguhan disarankan menggunakan algoritma enkripsi standar industri (seperti AES dengan kunci di server) atau menggunakan Firebase Functions backend

const SECRET_KEY = import.meta.env.VITE_LOCATION_SECRET || 'safetana_secret_123';

/**
 * Mengenkripsi koordinat lokasi pengguna menjadi string Base64 yang diacak
 * @param {Array} position - Format [lat, lng]
 * @returns {string} - Teks koordinat terenkripsi
 */
export const encryptLocation = (position) => {
    if (!position || position.length !== 2) return null;

    const data = JSON.stringify(position);
    // Simple XOR encryption for demonstration
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(data.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return btoa(encrypted); // Encode ke Base64 agar aman dikirim string
};

/**
 * Mendekripsi string Base64 kembali menjadi koordinat (Hanya digunakan oleh Admin)
 * @param {string} encryptedString 
 * @returns {Array|null}
 */
export const decryptLocation = (encryptedString) => {
    if (!encryptedString) return null;

    try {
        const decoded = atob(encryptedString);
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
        }
        return JSON.parse(decrypted);
    } catch (e) {
        console.error("Gagal mendekripsi lokasi", e);
        return null;
    }
};

/**
 * Masking PII (Personal Identifiable Information)
 * Contoh: "Budi Santoso" -> "B*** S******" atau "User Anonim"
 * @param {string} name 
 * @returns {string}
 */
export const maskName = (name) => {
    if (!name || name.trim() === '') return 'Anonymous User';

    return name.split(' ').map(word => {
        if (word.length <= 1) return word;
        return word.charAt(0) + '*'.repeat(word.length - 1);
    }).join(' ');
};

/**
 * Masking Nomor Telepon
 * Contoh: "081234567890" -> "0812****7890"
 */
export const maskPhone = (phone) => {
    if (!phone || phone.length < 8) return phone;
    const start = phone.substring(0, 4);
    const end = phone.substring(phone.length - 4);
    const maskedLength = phone.length - 8;
    return `${start}${'*'.repeat(maskedLength > 0 ? maskedLength : 4)}${end}`;
};

/**
 * XSS Sanitizer Dasar
 * Menghindari eksekusi script berbahaya dari input pengguna 
 * dengan mengkonversi karakter khusus HTML ke dalam bentuk entitas aman
 * @param {string} str - String input kotor
 * @returns {string} - String bersih
 */
export const sanitizeInput = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function (m) {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#039;';
            default: return m;
        }
    });
};
