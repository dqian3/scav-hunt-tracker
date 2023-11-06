import React, { useEffect, useState } from 'react';

import { db, auth } from './firebase'
import {GoogleAuthProvider, EmailAuthProvider, getAuth} from 'firebase/auth'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';


import { collection, getDocs } from "firebase/firestore";
import { Link } from 'react-router-dom';


const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: '/',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
        GoogleAuthProvider.PROVIDER_ID,
        EmailAuthProvider.PROVIDER_ID
    ],
};

export default function SignIn() {
    return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
}
