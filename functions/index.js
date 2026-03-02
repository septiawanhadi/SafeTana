const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({ origin: true });

admin.initializeApp();

/**
 * Cloud Function HTTPS Callable untuk mengirim push notification (Broadcast)
 * Fungsi ini hanya bisa dipanggil oleh pengguna yang sudah login (Authenticated)
 * dan sebaiknya memiliki custom claim 'admin' (bisa ditambahkan pengecekan)
 */
exports.sendBroadcastNotification = functions.https.onCall(async (data, context) => {
    // 1. Verifikasi Autentikasi
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'The function must be called while authenticated.'
        );
    }

    // (Opsional) 2. Verifikasi Role Admin (Jika menggunakan Custom Claims)
    // if (context.auth.token.admin !== true) {
    //   throw new functions.https.HttpsError(
    //     'permission-denied',
    //     'Only administrators can broadcast messages.'
    //   );
    // }

    const { title, body, topic } = data;

    if (!title || !body) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Title and body are required.'
        );
    }

    // Mengirim pesan ke topic tertentu (misalnya 'all_users' atau nama kecamatan)
    const targetTopic = topic || 'all_users';

    const message = {
        notification: {
            title: title,
            body: body,
        },
        topic: targetTopic,
        // Tambahkan data custom payload jika diperlukan oleh client
        data: {
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            sound: "default",
            status: "done",
            type: "alert"
        }
    };

    try {
        // 3. Menggunakan Firebase Admin SDK untuk mengirim pesan
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return { success: true, messageId: response };
    } catch (error) {
        console.error('Error sending message:', error);
        throw new functions.https.HttpsError('internal', 'Error sending sending notification.', error);
    }
});
