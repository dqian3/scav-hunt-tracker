import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

import EXIF from 'exif-js'

import { collection, query, doc, orderBy, addDoc} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';

import { db, storage } from './firebase'

import { convertBase64, classifyImage } from './classify';





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

    let leaderboard = new Map(players.docs.map((p) => [p.ref.path, 0]))

    // Note, we rely on the insertion order of the items here!
    let submsTable = new Map(items.docs.map((item) => [item.ref.path, players.docs.map((p) => null)]));
    // console.log(submsByItem);
    subms.docs.forEach((s) => {
        // Since this returns a ref, we need to ask for .path
        const playerIndex = players.docs.map(p => p.ref.path).indexOf(s.data().player.path);
        leaderboard.set(s.data().player.path, leaderboard.get(s.data().player.path) + 1);

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
            <tr>
                <td> <b>Leaderbaord</b></td>
                {
                    [...leaderboard.entries()].map(([player, score]) => <td key={player}>{score}</td>) 
                }

            </tr>

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
    items,
    players
}) {
    // User 
    const [player] = useOutletContext();

    // Form state
    const [image, setImage] = useState(null);
    const [imageObjURL, setImageObjURL] = useState("");

    const [itemToUpload, setItemToUpload] = useState("");
    // const [manualPlayer, setManualPlayer] = useState(player);

    // Feedback state
    const [guessItem, setGuessItem] = useState("");
    const [takenDate, setTakenDate] = useState(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => {
            console.log(files[0])
            setImage(files[0]);
            setImageObjURL(URL.createObjectURL(files[0]))
        }
    });


    function handleChangeImage(e) {
        setImage(e.target.files[0]);
        setImageObjURL(URL.createObjectURL(e.target.files[0]))
    };

    // TODO make this a better handler
    async function handleGuess() {
        const labels = items.docs.map((item) => item.data().desc);
        const encodedImage = await convertBase64(image);

        try {
            const results = await classifyImage(encodedImage, labels);

            const guess =  results[0]["label"];

            const guesses = results.slice(0, 5).map((res) => {
                const guessId = items.docs.find((item) => item.data().desc === res["label"])?.ref.path ?? "";

                return <button onClick={(e) => {e.preventDefault(); setItemToUpload(guessId)}}>                    
                    {`"${res["label"]}" (${Math.round(res["score"] * 100)}%)`}
                </button>
            })
            

            setGuessItem(guesses);

            const guessId = items.docs.find((item) => item.data().desc === guess)?.ref.path ?? "";

            if (guessId == "") {
                console.error(`Could not find ${guess} in items....`);
            }

            setItemToUpload(guessId);
            
        } catch {
            setGuessItem("Unable to connect to guessing service...")
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
                player: doc(db, "players/" + player), // TODO ew
                image: await getDownloadURL(imageRef),
                takenTime: takenDate,
                submittedTime: new Date(),
            }

            const result = addDoc(collection(db, "hunts", huntId, "submissions"), submission);

        } catch (error) {
            console.error(error);
        }

    }

    useEffect(() => {
        if (image === null) return;

        EXIF.getData(image, function() {

            let date = null;

            var exifDate = EXIF.getTag(this, "DateTimeOriginal");
            if (exifDate) {
                const [Y, M, D, h, m, s] =  exifDate.split(/[\: ]/);
                date = new Date(Y, M-1, D, h, m, s); // Month is 0 indexed for some reason lol
            } else if (image.lastModified) {
                date = new Date(image.lastModified)
            } else {
                date = new Date();
            }

            setTakenDate(date);
        });
    
        handleGuess();
    }, [image])


    return ( <div>
        <h3>Upload item</h3>

        <form>
            <img alt="pending image" height={200} src={imageObjURL} />
            <br />
            <input name='image' type="file" accept="image/*" capture="environment" onChange={handleChangeImage}/>
                
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                {
                    isDragActive ?
                    <p>Drop the files here ...</p> :
                    <p>Drag 'n' drop some files here, or click to select files</p>
                }
            </div>

            <br />
            <p>{guessItem}</p>
            <p>{takenDate?.toLocaleString()}</p>
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
            <select
                value={manualPlayer}
                onChange={(e) => { setManualPlayer(e.target.value) }}
            >
                <option value={""}>Select...</option>
                {players.docs.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}
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

            <SubmitItem huntId={huntId} items={items} players={players}></SubmitItem>

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
