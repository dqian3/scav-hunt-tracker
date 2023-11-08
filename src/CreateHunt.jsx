import React, { useEffect, useState } from 'react';

import { db } from './firebase'

import { collection, addDoc, updateDoc, doc, query, orderBy, arrayUnion } from "firebase/firestore";
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';

function EditHunt({
    curHunt
}) {
    // Firebase

    const curHuntRef = doc(db, "hunts", curHunt);

    const playersRef = collection(db, "players");

    const itemsRef = collection(db, "hunts", curHunt, "items");
    const itemsQuery = query(itemsRef, orderBy("author"));

    const [hunt, huntLoading, huntError] = useDocument(curHuntRef);
    const [players, playersLoading, playersError] = useCollection(playersRef);
    const [items, loading, error] = useCollection(itemsQuery);

    // Form state
    const [author, setAuthor] = useState("");
    const [newItems, setNewItems] = useState("");

    const [startDateInput, setStartDateInput] = useState("");
    const [endDateInput, setEndDateInput] = useState("");

    async function handleAddItem(e) {
        e.preventDefault();

        if (author === "") {
            alert("Select an author!");
            return;
        }

        newItems.trim().split("\n").forEach((item) => {
            addDoc(itemsRef, {
                desc: item.trim(),
                author: author,
            });
        })
    }

    async function handleUpdateOptions(e) {
        e.preventDefault();

        updateDoc(curHuntRef, {
            // + T00:00 forces JS to interpret as midnight for local tz
            startDate: new Date(startDateInput+"T00:00"),
            endDate: new Date(endDateInput+"T00:00"),
        });
    }

    useEffect(() => {
        if (hunt) {
            // firebase returns dates in {seconds: ... nanoseconds: ...}, convert to ms here

            const startDate = new Date(hunt.data().startDate.seconds * 1000);
            const endDate = new Date(hunt.data().endDate.seconds * 1000);

            setStartDateInput(startDate.toISOString().split("T")[0])
            setEndDateInput(endDate.toISOString().split("T")[0])
        }

    }, [hunt]);

    if (!players || !items) {
        return "Loading, if you see this after a while, there's probably an error..."
    }

    // firebase returns dates in {seconds: ... nanoseconds: ...}, convert to ms here
    const startDate = new Date(hunt.data().startDate.seconds * 1000);
    const endDate = new Date(hunt.data().endDate.seconds * 1000);

    return <div>

        Items: <ul> {items &&
            items.docs.map((item) => [item.id, item.data()]).map(([id, item]) =>
                <li key={id}>{item.desc} ({item.author})</li>
            )
        }
        </ul>

        <form onSubmit={handleAddItem}>
            <h3>Add items</h3>

            Author <select
                value={author}
                onChange={(e) => { setAuthor(e.target.value) }}
            >
                <option value={""}>Select...</option>
                {players.docs.map(h => <option key={h.id} value={h.id}>{h.id}</option>)}
            </select>

            <p>Item, separated by line</p>
            <textarea value={newItems} onChange={(e) => setNewItems(e.target.value)} />

            <br />
            <button type="submit">Submit</button>
        </form>

        <form onSubmit={handleUpdateOptions}>
            <h3>Edit Options</h3>

            <p>
            Start is currently: <b>{startDate.toString()}</b>
            </p>

            <input type="date" value={startDateInput} onChange={e => setStartDateInput(e.target.value)} />
            <br/>

            <p>
            End is currently: <b>{endDate.toString()}</b>
            </p>
            <input type="date" value={endDateInput} onChange={e => setEndDateInput(e.target.value)} />
            <br/>
            <button type="submit">Update</button>

        </form>
    </div>;

}


export default function CreateHunt() {
    // Firebase State
    const [hunts, loading, error] = useCollection(
        collection(db, 'hunts')
    );
    const [players, playersLoading, playersError] = useCollection(collection(db, "players"));

    // Form state
    let [curHunt, setCurHunt] = useState();
    let [newHuntName, setNewHuntName] = useState("")
    let [legacy, setLegacy] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault();

        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 1);
        defaultDate.setHours(0,0,0,0);

        const huntsRef = collection(db, "hunts");
        const newHuntRef = await addDoc(huntsRef, {
            "displayName": newHuntName,
            "startDate": defaultDate,
            "endDate": defaultDate,
            "players":  players.docs.map((p) => p.id), // TODO don't automatically include all players
            "legacy": legacy,
        });

        setCurHunt(newHuntRef.id);
    };

    if (hunts) {
        return <div>

            Create new hunt
            <form onSubmit={handleSubmit}>
                Legacy hunt (pre website) <input type="checkbox" checked={legacy} onChange={(e) => setLegacy(e.target.checked)}/>
                <br/>
                <input value={newHuntName} onChange={(e) => setNewHuntName(e.target.value)} />
                <button type="submit">Submit</button>
            </form>

            or select from existing:
            <select
                value={curHunt}
                onChange={(e) => { setCurHunt(e.target.value)  }}
            >
                <option value={""}>Select...</option>
                {hunts.docs.map(h => <option key={h.id} value={h.id}>{h.data().displayName}</option>)}
            </select>


            {curHunt &&<>
                <hr/>
                <EditHunt curHunt={curHunt}></EditHunt>
            </>}
        </div>
    } else {
        return "Loading"
    }

}