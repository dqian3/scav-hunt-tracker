import React, { useEffect, useState } from 'react';

import { db, auth } from './firebase'
import { useAuthState } from 'react-firebase-hooks/auth';


import { collection, getDocs, where, query } from "firebase/firestore";
import { Link, useOutletContext } from 'react-router-dom';

export default function Home() {
    // Root state
    const [curPlayer] = useOutletContext();

    // State from firebase
    let [hunts, setHunts] = useState({});

    // Form state
    let [curHunt, setCurHunt] = useState(localStorage.getItem("hunt") || "");


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

                <p>
                    Welcome {curPlayer}!
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