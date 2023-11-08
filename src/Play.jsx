import React, { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';

import EXIF from 'exif-js'

import { collection, query, doc, orderBy, addDoc} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';

import { db, storage } from './firebase'

import { convertBase64, classifyImage } from './classify';

// Todo update stuff in general

function SubmissionDisplay({
    submission,
    setCurSubDetails,
}) {

    if (submission == null) {
        return <input type='checkbox' checked={false} readOnly></input>
    }

    const [id, data] = submission;

    // TODO add info
    return <input type='checkbox' checked={true} readOnly onClick={(e) => setCurSubDetails(data)}></input>
}

function SummaryTable({
    items,
    subms,
    players,
    setCurSubDetails,
}) {

    // Note, we rely on the insertion order of the items here!
    let submsTable = new Map(items.docs.map((item) => [item.ref.path, players.docs.map((p) => null)]));
    // console.log(submsByItem);
    subms.docs.forEach((s) => {
        // Since this returns a ref, we need to ask for .path
        const playerIndex = players.docs.map(p => p.ref.path).indexOf(s.data().player.path);
        submsTable.get(s.data().item.path)[playerIndex] = ([s.id, s.data()]);
    });

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
                            // This is a bit hacky, but I add in the item description here so it can be displayed in SubmissionDetails
                            return <td key={item.id + "-" + i}>
                                <SubmissionDisplay submission={entry} setCurSubDetails={(s) => setCurSubDetails({...s, itemDesc: item.data().desc})}/>
                            </td>
                        } )
                    }
                </tr>)
            }
        </tbody>
    </table>
    );
}


function SubmitItem({
    huntId,
    items
}) {
    // Form state
    const [image, setImage] = useState(null);
    const [imageObjURL, setImageObjURL] = useState("");

    const [itemToUpload, setItemToUpload] = useState("");
    const [imageDate, setImageDate] = useState("");

    // Feedback state
    const [guessItem, setGuessItem] = useState("");


    // User state
    const [player] = useOutletContext();


    function handleChangeImage(e) {
        setImage(e.target.files[0]);
        setImageObjURL(URL.createObjectURL(e.target.files[0]))
    };


    function test() {
        EXIF.getData(image, function() {
            var allMetaData = EXIF.getAllTags(this);
            console.log(allMetaData)
        })
    }

    // TODO make this a better handler
    async function handleGuess() {
        const labels = items.docs.map((item) => item.data().desc);
        const encodedImage = await convertBase64(image);

        const results = await classifyImage(encodedImage, labels);


        if (results[0].score < 0.9) {
            const guessString = results.slice(0, 3).map((res) => `"${res["label"]}" (${Math.round(res["score"] * 100)}%)`).join(", or ")

            setGuessItem(`Not sure what this is, please manually choose an option
            If I had to guess, it would be: ` + guessString);
        } else {
            const guess =  results[0]["label"];
            const guessId = items.docs.find((item) => item.data().desc === guess)?.ref.path ?? "";

            if (guessId == "") {
                console.error(`Could not find ${guess} in items....`);
            }

            setGuessItem(`Is this "${guess}"?`);
            setItemToUpload(guessId);
        }
    }

    async function handleUpload(e) {
        e.preventDefault();
        // Upload file
        const imageRef = ref(storage, huntId + '/' + player + '/' + image.name);

        try {
            const imageSnap = await uploadBytes(imageRef, image);
            console.log(imageSnap)
            const submission = {
                item: doc(db, itemToUpload),
                player: doc(db, "players/" + "Axel"), // TODO ew
                image: await getDownloadURL(imageRef),
                submittedTime: new Date(),
            }

            const result = addDoc(collection(db, "hunts", huntId, "submissions"), submission);
            alert("Success!")

        } catch (error) {
            console.error(error);
        }

    }

    useEffect(() => {
        if (image === null) return;
        handleGuess();
    }, [image])


    return ( <div>
        <h3>Upload item</h3>

        <form>
            <img alt="pending image" height={200} src={imageObjURL} onClick={test}/>
            <br />
            <input name='image' type="file" accept="image/*" capture="environment" onChange={handleChangeImage}>
            </input>
            <br />
            <p>{guessItem}</p>
        </form>


        <form onSubmit={handleUpload}>
            <select
                value={itemToUpload}
                onChange={(e) => { setItemToUpload(e.target.value) }}
            >
                <option value={""}>Select...</option>
                {items.docs.map((item) => <option key={item.id} value={item.ref.path}>{item.data().desc}</option>)}
            </select>
            <br/>

            <button type='submit'>Submit</button>
        </form>
    </div>);
}

function SubmissionDetails({
    submission,
}) {
    const uploadDate = new Date(submission["submittedTime"].seconds * 1000);

    // Note, "itemDesc" comes from SummaryDetails hijacking setCurSubDetails to add the item
    // name
    return <div>
        <h4>{submission["player"].id}'s submission for "{submission["itemDesc"]}" </h4>
        <img src={submission["image"]}></img>
        <p>Uploaded at {uploadDate.toLocaleString()}</p>
    </div>
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

    const [curSubDetails, setCurSubDetails] = useState(null)

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

            <SubmitItem huntId={huntId} items={items}></SubmitItem>

            <br />
            <hr />
            <br />

            <SummaryTable items={items} subms={subms} players={players} setCurSubDetails={setCurSubDetails}></SummaryTable>

            { curSubDetails && <>
                <br />
                <hr />
                <br />
                <SubmissionDetails submission={curSubDetails}></SubmissionDetails>

            </>}
        </div>

    </div>
    );
}
