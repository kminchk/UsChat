import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAT3AFbh7PwsYDu8vdtvLIKBWNlLYUy3aQ",
  authDomain: "uschat-app.firebaseapp.com",
  projectId: "uschat-app",
  storageBucket: "uschat-app.firebasestorage.app",
  messagingSenderId: "911766746389",
  appId: "1:911766746389:web:c1ac33f78b42c73474651c",
  measurementId: "G-3FSEL569N3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const DEFAULT_IMAGES = {
  sky: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=400&auto=format&fit=crop&q=80',
  sea: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80'
};

// Initialize default users if they don't exist
async function initializeDefaultUsers() {
  try {
    const skyUser = await createUserWithEmailAndPassword(auth, 'sky@uschat.com', 'onlysea');
    await setDoc(doc(db, 'users', skyUser.user.uid), {
      username: 'sky',
      about: '',
      photoURL: DEFAULT_IMAGES.sky,
      lastSeen: new Date(),
      createdAt: new Date()
    });
  } catch (error: any) {
    if (error.code !== 'auth/email-already-in-use') {
      console.error('Error creating sky user:', error);
    }
  }

  try {
    const seaUser = await createUserWithEmailAndPassword(auth, 'sea@uschat.com', 'onlysky');
    await setDoc(doc(db, 'users', seaUser.user.uid), {
      username: 'sea',
      about: '',
      photoURL: DEFAULT_IMAGES.sea,
      lastSeen: new Date(),
      createdAt: new Date()
    });
  } catch (error: any) {
    if (error.code !== 'auth/email-already-in-use') {
      console.error('Error creating sea user:', error);
    }
  }
}

initializeDefaultUsers();