import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);