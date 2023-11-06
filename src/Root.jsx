import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from "react-router-dom";

import { db, auth } from './firebase'
import { useAuthState } from 'react-firebase-hooks/auth';

import { collection, getDocs, where, query } from "firebase/firestore";

export default function Root() {
    const [user, loading, error] = useAuthState(auth);
    const [curPlayer, setCurPlayer] = useState("");

    useEffect(() => {
        async function getPlayer() {
            const email = user.providerData[0].email
            const playersRef = collection(db, "players");

            const q = query(playersRef, where("email", "==", email));
            const qSnap = await getDocs(q);

            if (qSnap.size == 0) {
                setCurPlayer("Unknown")
            } else {
                if (qSnap.size > 1) {
                    console.warn(`Multiple players ${qSnap.size} found with email ${email}, taking first`);
                }
                setCurPlayer(qSnap.docs[0].id);
            }
        }
        if (user) {
            getPlayer();
        }
    }, [user]);

    if (!loading && !user) {
        return <Navigate to="/login"/>
    } 
    
    
    if (curPlayer === "Unknown") {
        return <p>
            You are not signed up, contact Dan :).
        </p>
    }
    return <Outlet context={[curPlayer]}></Outlet>

}