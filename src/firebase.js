import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { auth as authui } from 'firebaseui';

const firebaseConfig = {
    apiKey: "AIzaSyBLzEjIjV5XPRgPUClpCqP1sBek7CAhLass",
    authDomain: "scav-hunt-tracker.firebaseapp.com",
    projectId: "scav-hunt-tracker",
    storageBucket: "scav-hunt-tracker.appspot.com",
    messagingSenderId: "773520817721",
    appId: "1:773520817721:web:ca5fcfda3abe64aeab57e8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

var signInUI = new authui.AuthUI(auth);

export {app, db, auth, signInUI}