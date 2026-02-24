import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase } from "firebase/database";
//import { getAnalytics } from "firebase/analytics";

import firebaseConfig from '../firebase.json';

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
