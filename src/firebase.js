import 'dotenv/config'

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "scav-hunt-tracker.firebaseapp.com",
    projectId: "scav-hunt-tracker",
    storageBucket: "scav-hunt-tracker.appspot.com",
    messagingSenderId: process.env.FIREABSE_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {app, db}