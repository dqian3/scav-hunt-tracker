import React, { useEffect, useState } from 'react';

import { db } from './firebase'

import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function CreateHunt() {
    // const [items, setItems] = useState("");

    // async function handleSubmit(e) {
    //     e.preventDefault();

    //     const huntRef = doc(db, "hunts", curHunt);
    //     await updateDoc(huntRef, {
    //         items: items.split("\n").map((item) => ({
    //             description: item.trim()
    //         }))
    //     });
    // }

    // return <form onSubmit={handleSubmit}>
    //     <h3>Set items</h3>

    //     <p>Items, separated by line</p>
    //     <textarea value={items} onChange={(e) => setItems(e.target.value)} />

    //     <br />
    //     <button type="submit">Submit</button>
    // </form>


}