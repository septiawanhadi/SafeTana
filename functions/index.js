const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Helper: Send broadcast to all Telegram subscribers
 */
async function broadcastToTelegram(title, body) {
    const token = functions.config().telegram?.token;
    if (!token) {
        console.warn("Telegram token not set in Firebase config.");
        return;
    }

    try {
        const subscribersSnap = await admin.firestore().collection('telegram_subscribers').get();
        if (subscribersSnap.empty) return;

        const message = `🔔 *${title}*\n\n${body}`;
        const promises = subscribersSnap.docs.map(doc => {
            const chatId = doc.id;
            return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
        });

        await Promise.all(promises);
        console.log(`Broadcasted to ${subscribersSnap.size} Telegram users.`);
    } catch (error) {
        console.error("Error broadcasting to Telegram:", error);
    }
}

/**
 * Cloud Function to subscribe a token to the 'all_users' topic
 */
exports.subscribeToTopic = functions.https.onCall(async (data) => {
    const { token, topic = 'all_users' } = data;
    if (!token) {
        throw new functions.https.HttpsError('invalid-argument', 'Token is required.');
    }
    try {
        await admin.messaging().subscribeToTopic(token, topic);
        console.log(`Successfully subscribed token to ${topic}`);
        return { success: true };
    } catch (error) {
        console.error('Error subscribing to topic:', error);
        throw new functions.https.HttpsError('internal', 'Error subscribing to topic.');
    }
});

exports.pollBmkgHazards = functions.pubsub.schedule('every 5 minutes').onRun(async () => {
    const BMKG_AUTO = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
    const BMKG_FELT = 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json';
    const BMKG_MIN_5 = 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json';
    const GDACS_API = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP';

    try {
        const stateRef = admin.firestore().doc('system/bmkg_state');
        const doc = await stateRef.get();
        const currentState = doc.exists ? doc.data() : {};

        // 1. Check BMKG Earthquakes
        const checkNewEvents = async (url, stateKey, notificationPrefix, isList = false) => {
            const res = await fetch(url);
            const jsonData = await res.json();
            const quakes = isList ? jsonData.Infogempa.gempa : [jsonData.Infogempa.gempa];
            
            if (!quakes || quakes.length === 0) return;

            const latestQuake = quakes[0];
            const latestId = `${latestQuake.Tanggal}-${latestQuake.Jam}-${latestQuake.Magnitude}`;
            const lastId = currentState[stateKey];

            if (latestId !== lastId) {
                const title = `${notificationPrefix}: M ${latestQuake.Magnitude}`;
                const body = `${latestQuake.Wilayah}. Kedalaman: ${latestQuake.Kedalaman}. ${latestQuake.Potensi || ''}`;
                
                // FCM
                await admin.messaging().send({
                    notification: { title, body },
                    topic: 'all_users',
                    data: { type: 'earthquake_alert', magnitude: latestQuake.Magnitude, id: latestId }
                });

                // Telegram
                await broadcastToTelegram(title, body);

                currentState[stateKey] = latestId;
            }
        };

        await checkNewEvents(BMKG_AUTO, 'last_auto_id', 'Gempa Terbaru');
        await checkNewEvents(BMKG_FELT, 'last_felt_id', 'Gempa Dirasakan', true);
        await checkNewEvents(BMKG_MIN_5, 'last_min5_id', 'Gempa M 5.0+', true);

        // 2. Check GDACS for Indonesia (Floods, Cyclones, etc.)
        try {
            const gdacsRes = await fetch(GDACS_API);
            const gdacsData = await gdacsRes.json();
            if (gdacsData.features) {
                const idnEvents = gdacsData.features.filter(f => 
                    f.properties && f.properties.country && f.properties.country.toLowerCase().includes('indonesia')
                );

                if (idnEvents.length > 0) {
                    const latest = idnEvents[0].properties;
                    const latestId = `gdacs-${latest.eventid}`;
                    if (latestId !== currentState.last_gdacs_id) {
                        const title = `Peringatan Bencana (GDACS): ${latest.eventname}`;
                        const body = `Tipe: ${latest.eventtype}. Level: ${latest.alertlevel}. ${latest.description || ''}`;
                        
                        await admin.messaging().send({ 
                            notification: { title, body }, 
                            topic: 'all_users' 
                        });
                        await broadcastToTelegram(title, body);
                        
                        currentState.last_gdacs_id = latestId;
                    }
                }
            }
        } catch (e) { console.error("GDACS fetch error:", e); }

        // Save updated state
        await stateRef.set({
            ...currentState,
            last_updated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 3. Weather Warnings (Bandung)
        const BANDUNG_ADM4 = '32.73.01.1003';
        const weatherRes = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${BANDUNG_ADM4}`);
        const weatherData = await weatherRes.json();
        
        if (weatherData?.data?.[0]) {
            const forecasts = weatherData.data[0].cuaca.flat();
            const dangerHours = forecasts.filter(f => f.weather === 95 || f.weather === 97);
            
            if (dangerHours.length > 0) {
                const weatherId = `weather-alert-${dangerHours[0].datetime}`;
                const weatherStateRef = admin.firestore().doc('system/weather_state');
                const weatherDoc = await weatherStateRef.get();
                const lastWeatherId = weatherDoc.exists ? weatherDoc.data().last_id : null;

                if (weatherId !== lastWeatherId) {
                    const title = 'Peringatan Cuaca Ekstrem';
                    const body = 'Berpotensi terjadi hujan lebat disertai petir di wilayah Bandung. Tetap waspada.';
                    
                    await admin.messaging().send({ notification: { title, body }, topic: 'all_users' });
                    await broadcastToTelegram(title, body);

                    await weatherStateRef.set({ last_id: weatherId, last_updated: admin.firestore.FieldValue.serverTimestamp() });
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error in pollBmkgHazards:', error);
        return null;
    }
});

