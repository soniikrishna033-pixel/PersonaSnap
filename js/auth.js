import { auth, db, GoogleAuthProvider, signInWithPopup, signOut, doc, setDoc, getDoc } from './firebase.js';

let currentUser = null;

// Mock login logic when Firebase is not configured
const mockSignIn = () => {
  const mockUser = {
    uid: 'mock-user-123',
    displayName: 'Guest User',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
    email: 'guest@personasnap.com'
  };
  localStorage.setItem('mockUser', JSON.stringify(mockUser));
  window.location.reload();
};

export const signIn = async () => {
  if (!auth.currentUser && !auth.app) {
    mockSignIn();
    return;
  }
  
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in db, if not create profile
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        xp: 0,
        level: 'Bronze',
        quizzesTaken: 0,
        createdAt: new Date().toISOString(),
        streak: 0,
        lastActive: new Date().toISOString(),
        readBlogs: [],
        knowledgePoints: 0,
        quizHistory: []
      });
    }
    window.location.reload();
  } catch (error) {
    console.error("Error signing in", error);
    alert("Sign in failed. See console for details.");
  }
};

export const logOut = async () => {
  try {
    if (auth.signOut) {
      await auth.signOut();
    }
  } catch (error) {
    console.error("Error signing out", error);
  }
};

// Listen to auth state globally and update UI
auth.onAuthStateChanged((user) => {
  currentUser = user;
  const btnSignIn = document.getElementById('btn-signin');
  
  if (user) {
    if (btnSignIn) {
      btnSignIn.textContent = 'Dashboard';
      btnSignIn.onclick = () => window.location.href = '/dashboard.html';
    }
    
    // Attempt to update nav xp (mock for now, we'll implement levels.js later to fetch real XP)
    const navXp = document.getElementById('nav-xp');
    if(navXp) {
      navXp.style.display = 'block';
      let xp = localStorage.getItem('mockXp') || 0;
      navXp.textContent = `${xp} XP`;
    }
  } else {
    if (btnSignIn) {
      btnSignIn.textContent = 'Sign In';
      btnSignIn.onclick = signIn;
    }
  }
});

export { currentUser };
