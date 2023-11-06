import React, { useEffect, useState } from 'react';

import { db, auth, signInUI } from './firebase'
import {GoogleAuthProvider, EmailAuthProvider} from 'firebase/auth'

import { collection, getDocs } from "firebase/firestore";
import { Link } from 'react-router-dom';


// TODO try using react-firebaseui
// signInUI.start('#firebaseui-auth-container', {
//     signInOptions: [
//         EmailAuthProvider.PROVIDER_ID,
//         GoogleAuthProvider.PROVIDER_ID,

//     ],
//     // Other config options...
// });
  

export default function App() {
    // State from firebase_
    let [hunts, setHunts] = useState({});
    let [players, setPlayers] = useState([]);

    // Form state
    let [curPlayer, setCurPlayer] = useState(localStorage.getItem("player") || "");
    let [curHunt, setCurHunt] = useState(localStorage.getItem("hunt") || "");

    useEffect(() => {
        async function getData() {
            let results = await getDocs(collection(db, "players"));
            setPlayers(results.docs.map((doc) => doc.id));

            results = await getDocs(collection(db, "hunts"));
            setHunts(Object.fromEntries(results.docs.map((doc) => [doc.id, doc.data()])));
        }
        getData();
    }, []);

    return (
        <div className="App">
            <h1>
                Scav Hunt Central
            </h1>

            <div>

                <p>
                    Who are you:
                    <select
                        value={curPlayer}
                        // Set the current player AND save to local storage
                        onChange={e => { setCurPlayer(e.target.value) }}
                    >
                        {players.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </p>

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