const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;
const CRON_SECRET = process.env.CRON_SECRET || "safetana_secret_123";

/**
 * Helper: Send Telegram Message
 */
async function sendTelegramMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: chatId, 
                text: text,
                parse_mode: 'Markdown'
            })
        });
    } catch (error) {
        console.error("Error sending Telegram message:", error);
    }
}

/**
 * Helper: Firestore REST GET
 */
async function getFirestoreDoc(path) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    // Flatten Firestore fields to a simple object
    const obj = {};
    if (data.fields) {
        for (const [key, value] of Object.entries(data.fields)) {
            obj[key] = value.stringValue || value.integerValue || value.doubleValue || value.booleanValue || value.timestampValue;
        }
    }
    return obj;
}

/**
 * Helper: Firestore REST PATCH
 */
async function updateFirestoreDoc(path, data) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`;
    const fields = {};
    for (const [key, val] of Object.entries(data)) {
        if (typeof val === 'number') fields[key] = { doubleValue: val };
        else if (typeof val === 'boolean') fields[key] = { booleanValue: val };
        else fields[key] = { stringValue: String(val) };
    }
    
    await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
    });
}

/**
 * Helper: List Telegram Subscribers
 */
async function getSubscribers() {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/telegram_subscribers`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map(doc => {
        const parts = doc.name.split('/');
        return parts[parts.length - 1]; // Return the chatId/docId
    });
}

export default async function handler(request, response) {
    // 1. Security Check
    const auth = request.headers['authorization'] || request.query.secret;
    if (auth !== CRON_SECRET) {
        return response.status(401).json({ error: "Unauthorized" });
    }

    const BMKG_AUTO = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
    const GDACS_API = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP';

    try {
        // Fetch current state
        const currentState = await getFirestoreDoc('system/bmkg_state') || {};
        const subscribers = await getSubscribers();

        let updated = false;

        // 2. Check BMKG
        const bmkgRes = await fetch(BMKG_AUTO);
        const bmkgData = await bmkgRes.json();
        const quake = bmkgData.Infogempa.gempa;
        const quakeId = `${quake.Tanggal}-${quake.Jam}-${quake.Magnitude}`;

        if (quakeId !== currentState.last_auto_id) {
            const title = "Gempa Bumi Terbaru";
            const body = `${quake.Wilayah}. M ${quake.Magnitude}. Kedalaman: ${quake.Kedalaman}. ${quake.Potensi}`;
            
            for (const chatId of subscribers) {
                await sendTelegramMessage(chatId, `🔔 *${title}*\n\n${body}`);
            }
            currentState.last_auto_id = quakeId;
            updated = true;
        }

        // 3. Check GDACS
        const gdacsRes = await fetch(GDACS_API);
        const gdacsData = await gdacsRes.json();
        if (gdacsData.features) {
            const idnEvents = gdacsData.features.filter(f => 
                f.properties && f.properties.country && f.properties.country.toLowerCase().includes('indonesia')
            );
            if (idnEvents.length > 0) {
                const event = idnEvents[0].properties;
                const eventId = `gdacs-${event.eventid}`;
                if (eventId !== currentState.last_gdacs_id) {
                    const title = `Peringatan Bencana (GDACS): ${event.eventname}`;
                    const body = `Tipe: ${event.eventtype}. Level: ${event.alertlevel}. ${event.description || ''}`;
                    
                    for (const chatId of subscribers) {
                        await sendTelegramMessage(chatId, `🔔 *${title}*\n\n${body}`);
                    }
                    currentState.last_gdacs_id = eventId;
                    updated = true;
                }
            }
        }

        if (updated) {
            await updateFirestoreDoc('system/bmkg_state', currentState);
        }

        return response.status(200).json({ success: true, updated });
    } catch (error) {
        console.error("Cron Poll Error:", error);
        return response.status(500).json({ error: error.message });
    }
}
