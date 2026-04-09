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

exports.pollBmkgHazards = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
    const BMKG_AUTO = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
    const BMKG_FELT = 'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json';
    const BMKG_MIN_5 = 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json';

    try {
        const stateRef = admin.firestore().doc('system/bmkg_state');
        const doc = await stateRef.get();
        const currentState = doc.exists ? doc.data() : {};

        // Helper to notify and update state
        const checkNewEvents = async (url, stateKey, notificationPrefix, isList = false) => {
            const res = await fetch(url);
            const jsonData = await res.json();
            const quakes = isList ? jsonData.Infogempa.gempa : [jsonData.Infogempa.gempa];
            
            if (quakes.length === 0) return;

            const latestQuake = quakes[0];
            const latestId = `${latestQuake.Tanggal}-${latestQuake.Jam}-${latestQuake.Magnitude}`;
            const lastId = currentState[stateKey];

            if (latestId !== lastId) {
                console.log(`New event in ${stateKey}:`, latestId);
                
                // Send push notification for the newest one
                await admin.messaging().send({
                    notification: {
                        title: `${notificationPrefix}: M ${latestQuake.Magnitude}`,
                        body: `${latestQuake.Wilayah}. Kedalaman: ${latestQuake.Kedalaman}. ${latestQuake.Potensi || ''}`,
                    },
                    topic: 'all_users',
                    data: { type: 'earthquake_alert', magnitude: latestQuake.Magnitude, id: latestId }
                });

                // Update state in memory for next endpoint in this run
                currentState[stateKey] = latestId;
            }
        };

        // Run checks for all earthquake endpoints
        await checkNewEvents(BMKG_AUTO, 'last_auto_id', 'Gempa Terbaru');
        await checkNewEvents(BMKG_FELT, 'last_felt_id', 'Gempa Dirasakan', true);
        await checkNewEvents(BMKG_MIN_5, 'last_min5_id', 'Gempa M 5.0+', true);

        // Save updated state
        await stateRef.set({
            ...currentState,
            last_updated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

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
