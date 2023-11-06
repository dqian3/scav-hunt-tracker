import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, doc, orderBy } from "firebase/firestore";

import { db } from './firebase'

import { useCollection, useDocument } from 'react-firebase-hooks/firestore';

import { convertBase64, classifyImage } from './classify';

// Todo update stuff in general

function SubmissionDisplay({
    submission
}) {

    if (submission == null) {
        return <input type='checkbox' checked={false} readOnly></input>
    }

    const [id, data] = submission;

    // TODO add info
    return <input type='checkbox' checked={true} readOnly></input>
}

function SummaryTable({
    items,
    subms,
    players
}) {

    // Note, we rely on the insertion order of the items here!
    let submsTable = new Map(items.docs.map((item) => [item.ref.path, players.docs.map((p) => null)]));
    // console.log(submsByItem);
    subms.docs.forEach((s) => {
        // Since this returns a ref, we need to ask for .path
        const playerIndex = players.docs.map(p => p.ref.path).indexOf(s.data().player.path);
        submsTable.get(s.data().item.path)[playerIndex] = ([s.id, s.data()]);
    });

    console.log(submsTable);

    return (               
    <table>
        <thead>
            <tr>
                <th>Item</th>
                {
                    players.docs.map(p => <th key={p.id}>{p.id}</th>)
                }
            </tr>
        </thead>

        <tbody>
            {
                items.docs.map((item) => <tr key={item.id}>
                    <td>{item.data().desc}</td>
                    {
                        submsTable.get(item.ref.path).map((entry, i) => {
                            return <td key={item.id + "-" + i}> 
                                <SubmissionDisplay submission={entry}></SubmissionDisplay>
                            </td>
                        } )
                    }
                </tr>)
            }
        </tbody>
    </table>
    );
}


export default function Play() {
    let { huntId } = useParams();

    // State from firebase
    const huntRef = doc(db, "hunts", huntId);
    const playersRef = collection(db, "players");

    const itemsRef = collection(db, "hunts", huntId, "items");
    const itemsQuery = query(itemsRef, orderBy("author"));

    const submsRef = collection(db, "hunts", huntId, "submissions");

    const [hunt, huntLoading, huntError] = useDocument(huntRef);
    const [players, playersLoading, playersError] = useCollection(playersRef);
    const [items, itemsLoading, itemsError] = useCollection(itemsQuery);
    const [subms, submsLoading, submsError] = useCollection(submsRef);

    // Form state
    let [image, setImage] = useState(null);
    let [imageObjURL, setImageObjURL] = useState("");

    // Feedback state
    let [guessItem, setGuessItem] = useState("");


    function handleChangeImage(e) {
        setImage(e.target.files[0]);
        setImageObjURL(URL.createObjectURL(e.target.files[0]))
    };


    // TODO make this a better handler
    async function handleGuess() {
        const labels = Object.values(items).map((item) => item.desc);
        const encodedImage = await convertBase64(image);

        const results = await classifyImage(encodedImage, labels);

        if (results[0].score < 0.9) {
            setGuessItem(JSON.stringify(results.slice(0, 3)));
        } else {
            setGuessItem(`Submit '${results[0]["label"]}?`);
        }
    }

    useEffect(() => {
        if (image === null) return;
        handleGuess();
    }, [image])


    // Probably a better way to do this lol
    if (huntLoading || playersLoading || itemsLoading || submsLoading) {
        return <p>Loading</p>
    }

    if (huntError || playersError || itemsError || submsError) {
        return <p>Error!</p>
    }


    return (
    <div>
        <h1>
            Scav Hunt Central
        </h1>

        <div>
            <h3>Upload item</h3>

            <form>
                <img alt="pending image" height={200} src={imageObjURL} />
                <br />
                <input name='image' type="file" accept="image/*" capture="environment" onChange={handleChangeImage}>
                </input>
                <br />
                <h4>{guessItem}</h4>

            </form>

            <br />
            <hr />
            <br />

            <SummaryTable items={items} subms={subms} players={players}></SummaryTable>
        </div>

    </div>
    );
}
