import { db } from './firebase.js';
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

/**
 * Fetches the user profile from Firestore
 */
export const getUserProfile = async (uid) => {
  if (!db || !db.getDoc) return null; // Fallback if Firebase not initialized
  
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * Updates user quiz results: XP, streak, history
 */
export const syncQuizResult = async (uid, resultData, newXp, streak) => {
  if (!db || !db.updateDoc) return;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentHistory = userData.quizHistory || [];
      currentHistory.push(resultData);
      
      const quizzesTaken = (userData.quizzesTaken || 0) + 1;
      
      // Determine level based on XP (simple logic)
      let level = userData.level || 'Bronze';
      if (newXp >= 1000) level = 'Diamond';
      else if (newXp >= 500) level = 'Gold';
      else if (newXp >= 200) level = 'Silver';
      
      await updateDoc(userRef, {
        xp: newXp,
        streak: streak,
        quizHistory: currentHistory,
        quizzesTaken: quizzesTaken,
        level: level,
        lastActive: new Date().toISOString(),
        lastQuizDate: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error syncing quiz result:", error);
  }
};

/**
 * Updates user blog reading: KP and readBlogs
 */
export const syncBlogRead = async (uid, blogId, kp, readingStreak) => {
  if (!db || !db.updateDoc) return;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const readBlogs = userData.readBlogs || [];
      
      if (!readBlogs.includes(blogId)) {
        readBlogs.push(blogId);
      }
      
      await updateDoc(userRef, {
        knowledgePoints: kp,
        readBlogs: readBlogs,
        readingStreak: readingStreak,
        lastActive: new Date().toISOString(),
        lastReadDate: new Date().toISOString().split('T')[0]
      });
    }
  } catch (error) {
    console.error("Error syncing blog read:", error);
  }
};

/**
 * Fetches the global leaderboard (top 50 users by XP)
 */
export const getLeaderboard = async () => {
  if (!db || !db.getDocs) return [];
  
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('xp', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    
    const leaderboard = [];
    snapshot.forEach((doc) => {
      leaderboard.push({ uid: doc.id, ...doc.data() });
    });
    
    return leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};
