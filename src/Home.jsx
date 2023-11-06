import React, { useEffect, useState } from 'react';

import { db, auth } from './firebase'
import {GoogleAuthProvider, EmailAuthProvider, getAuth} from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth';


import { collection, getDoc, getDocs, where, query } from "firebase/firestore";
import { Link } from 'react-router-dom';


const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: '/signedIn',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
        GoogleAuthProvider.PROVIDER_ID,
        EmailAuthProvider.PROVIDER_ID
    ],
};

export default function Home() {
    // State from firebase
    let [hunts, setHunts] = useState({});

    const [user, loading, error] = useAuthState(auth);

    // Form state
    let [curPlayer, setCurPlayer] = useState("");
    let [curHunt, setCurHunt] = useState(localStorage.getItem("hunt") || "");

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

    useEffect(() => {
        async function getData() {
            const huntsRef = collection(db, "hunts")
            const q = query(huntsRef, where("players", "array-contains", curPlayer));

            const results = await getDocs(q);
            setHunts(Object.fromEntries(results.docs.map((doc) => [doc.id, doc.data()])));
        }

        if (curPlayer) {
            getData();
        }
    }, [curPlayer]);


    return (
        <div>
            <h1>
                Scav Hunt Central
            </h1>

            <div>

                {user &&
                    <p>
                        Welcome {curPlayer}!
                    </p>
                }

                <p>
                    What scavenger hunt?
                    <select
                        value={curHunt}
                        onChange={(e) => { setCurHunt(e.target.value) }}
                    >
                        <option value={""}>Select...</option>
                        {Object.entries(hunts).map(([hId, h]) => <option key={hId} value={hId}>{h.displayName}</option>)}
                    </select>
                </p>
            </div>

            <Link to={"/play/" + curHunt} >Go</Link>
        </div>
    );
}