import { db } from '../../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, orderBy, limit } from 'firebase/firestore';

/**
 * Service for handling all Health-related Firestore operations
 */
export const dataService = {
  /**
   * MOOD LOGS OPERATIONS
   */
  moodLogs: {
    async add(userId, moodData) {
      try {
        return await addDoc(collection(db, 'mood_logs'), {
          userId,
          ...moodData,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("dataService.moodLogs.add error:", error);
        throw error;
      }
    },

    async fetchAll(userId) {
      try {
        const q = query(
          collection(db, 'mood_logs'),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        const logs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort descending locally to avoid index requirement overhead for simple queries
        return logs.sort((a, b) => {
          const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
          const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
          return timeB - timeA;
        });
      } catch (error) {
        console.error("dataService.moodLogs.fetchAll error:", error);
        throw error;
      }
    },

    async delete(logId) {
      try {
        await deleteDoc(doc(db, 'mood_logs', logId));
      } catch (error) {
        console.error("dataService.moodLogs.delete error:", error);
        throw error;
      }
    }
  },

  /**
   * HEALTH SCREENINGS OPERATIONS
   */
  healthScreenings: {
    async add(userId, screeningData) {
      try {
        return await addDoc(collection(db, 'health_screenings'), {
          userId,
          ...screeningData,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("dataService.healthScreenings.add error:", error);
        throw error;
      }
    },

    async fetchLatest(userId) {
      try {
        const q = query(
          collection(db, 'health_screenings'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        return {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        };
      } catch (error) {
        console.error("dataService.healthScreenings.fetchLatest error:", error);
        throw error;
      }
    }
  }
};
