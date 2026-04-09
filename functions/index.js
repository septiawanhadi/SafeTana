const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({ origin: true });

admin.initializeApp();

/**
 * Cloud Function to subscribe a token to the 'all_users' topic
 */
exports.subscribeToTopic = functions.https.onCall(async (data, context) => {
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

/**
 * Scheduled function to poll BMKG every 5 minutes
 */
exports.pollBmkgHazards = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
    const BMKG_LATEST = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
    const BMKG_FELT = 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json';

    try {
        // 1. Fetch Latest Earthquake (Autogempa)
        const response = await fetch(BMKG_LATEST);
        const data = await response.json();
        const latest = data.Infogempa.gempa;
        const latestId = `${latest.Tanggal}-${latest.Jam}-${latest.Magnitude}`;

        // Check against last seen ID in Firestore
        const stateRef = admin.firestore().doc('system/bmkg_state');
        const doc = await stateRef.get();
        const lastSeenId = doc.exists ? doc.data().last_earthquake_id : null;

        if (latestId !== lastSeenId) {
            console.log('New earthquake detected:', latestId);

            // Send push notification
            const message = {
                notification: {
                    title: `Gempa Terbaru: M ${latest.Magnitude}`,
                    body: `${latest.Wilayah}. Kedalaman: ${latest.Kedalaman}. Potensi: ${latest.Potensi || 'Tidak berpotensi tsunami'}.`,
                },
                topic: 'all_users',
                data: {
                    type: 'earthquake_alert',
                    magnitude: latest.Magnitude,
                    id: latestId
                }
            };

            await admin.messaging().send(message);

            // Update state
            await stateRef.set({
                last_earthquake_id: latestId,
                last_updated: admin.firestore.FieldValue.serverTimestamp(),
                latest_data: latest
            }, { merge: true });
        }

        // 2. Fetch Bandung Weather Warnings
        const BANDUNG_ADM4 = '32.73.01.1003';
        const weatherRes = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${BANDUNG_ADM4}`);
        const weatherData = await weatherRes.json();
        
        if (weatherData && weatherData.data && weatherData.data[0]) {
            const forecasts = weatherData.data[0].cuaca.flat();
            const dangerHours = forecasts.filter(f => f.weather === 95 || f.weather === 97); // Hujan Petir
            
            if (dangerHours.length > 0) {
                const weatherId = `weather-alert-${dangerHours[0].datetime}`;
                const weatherStateRef = admin.firestore().doc('system/weather_state');
                const weatherDoc = await weatherStateRef.get();
                const lastWeatherId = weatherDoc.exists ? weatherDoc.data().last_id : null;

                if (weatherId !== lastWeatherId) {
                    await admin.messaging().send({
                        notification: {
                            title: 'Peringatan Cuaca Ekstrem',
                            body: 'Berpotensi terjadi hujan lebat disertai petir di wilayah Bandung. Tetap waspada.',
                        },
                        topic: 'all_users'
                    });
                    await weatherStateRef.set({ last_id: weatherId, last_updated: admin.firestore.FieldValue.serverTimestamp() });
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error polling BMKG:', error);
        return null;
    }
});
