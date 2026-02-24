import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase } from "firebase/database";
//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDk0FrfR4STYOf8NDGDE79qOh5OhjPd-cs",
    authDomain: "planeao-8a7e9.firebaseapp.com",
    projectId: "planeao-8a7e9",
    storageBucket: "planeao-8a7e9.firebasestorage.app",
    messagingSenderId: "994511939746",
    appId: "1:994511939746:web:710cdce1177a3292728ffb",
    measurementId: "G-FPB62P2PG1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Auth helper functions
export const logInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
};

export const logOut = () => {
    return signOut(auth);
};
