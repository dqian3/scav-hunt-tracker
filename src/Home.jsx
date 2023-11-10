import React, { useEffect, useState } from 'react';

import { db, auth } from './firebase'
import { useAuthState } from 'react-firebase-hooks/auth';


import { collection, getDocs, where, query } from "firebase/firestore";
import { useCollection } from 'react-firebase-hooks/firestore';
import { Link, useOutletContext } from 'react-router-dom';

export default function Home() {
    // Root state
    const [curPlayer] = useOutletContext();

    // State from firebase
    const [hunts, loading, error] = useCollection(collection(db, "hunts"))

    // Form state
    const [curHunt, setCurHunt] = useState("");

    if (loading || error) {
        return <p>
            Loading...
        </p>
    }

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
                        {hunts.docs.map(h => <option key={h.id} value={h.id}>{h.data().displayName}</option>)}
                    </select>
                </p>
            </div>

            {curHunt !== "" && 
                <Link to={"/play/" + curHunt} disabled>Go</Link>
            }
        </div>
    );
}