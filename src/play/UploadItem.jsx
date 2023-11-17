
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

import { db, storage } from '../firebase'
import { collection, query, doc, addDoc, where, and, getDocs, updateDoc} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL} from 'firebase/storage';

import EXIF from 'exif-js';
import moment from 'moment';

import { convertBase64, classifyImage } from '../classify';

// Styling stuff
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faCamera } from '@fortawesome/free-solid-svg-icons'

function UploadItem({
    huntId,
    items,
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
    const [submitting, setSubmitting] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => {
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

                return <button
                    key={guessId}
                    style={{marginRight: "4px"}}
                    onClick={(e) => {e.preventDefault(); setItemToUpload(guessId)}}
                >
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

        if (submitting) {
            return;
        }

        // Check if submission exists!
        const q = query(collection(db, "hunts", huntId, "submissions"), and(
            where("item", "==", doc(db, itemToUpload)),
            where("player", "==", doc(db, "players/" + player)),
            where("active", "==", true)
        ))

        const result = await getDocs(q)


        if (!result.empty) {
            if (!window.confirm(`Overwrite your previous submission?`)) return;

            await Promise.all(result.docs.map((submission) =>
                updateDoc(submission.ref, {
                    "active": false
                })
            ));
        }

        // Upload file
        setSubmitting(true);

        try {
            const imageRef = ref(storage, huntId + '/' + player + '/' + image.name);
            const imageSnap = await uploadBytes(imageRef, image);
            const submission = {
                item: doc(db, itemToUpload),
                player: doc(db, "players/" + player), // TODO ew
                image: await getDownloadURL(imageRef),
                imageRef: imageRef.fullPath,
                takenTime: takenDate,
                submittedTime: new Date(),
                active: true
            }

            const result = await addDoc(collection(db, "hunts", huntId, "submissions"), submission);

        } catch (error) {
            console.error(error);
        }


        setImage(null);
        setTakenDate(null);
        setGuessItem("");
        setItemToUpload("");

        setSubmitting(false);
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

        {!image && <>
            <div>
                <label
                    style={{
                        border: "2px solid",
                        borderRadius: "5px",
                        maxWidth: "500px",
                        padding: "10px 10px",
                        margin: "0 0 0.5rem 0",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}

                >
                    <FontAwesomeIcon icon={faCamera} />&nbsp; Capture item!
                    <input style={{display: "none"}}
                        name='image'
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleChangeImage}
                    />
                </label>
            </div>


            <div
                {...getRootProps()}
                style={{
                    border: "2px solid",
                    borderRadius: "5px",
                    maxWidth: "500px",
                    minHeight: "200px",
                    padding: "10px 10px",

                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column"
                }}
            >
                <input {...getInputProps()} />


                <div style={{
                    fontSize:"3em",
                }}>
                    <FontAwesomeIcon icon={faUpload} />
                </div>
                <div>or upload a file</div>
                <div  style={{
                    fontSize:"0.6rem",
                }}>(drag and drop)</div>

            </div>

        </>}


        {image && <div>
            <img height={240} src={imageObjURL} />

            <p>
                <b>Image date:</b> {takenDate?.toLocaleString()}
            </p>


            <label>
                Edit date (if incorrect)&nbsp;
                <input type='datetime-local' value={moment(takenDate).format("YYYY-MM-DDTHH:mm:ss")} onChange={(e) => {
                    setTakenDate(new Date(Date.parse(e.target.value)))
                }}/>
            </label>


            <p>{guessItem}</p>


            <form onSubmit={handleUpload}>
            <select
                value={itemToUpload}
                onChange={(e) => { setItemToUpload(e.target.value) }}
            >
                <option value={""}>Select...</option>
                {items.docs.map((item) => <option key={item.id} value={item.ref.path}>{item.data().desc}</option>)}
            </select>

            <br/>
            <br/>

            <button disabled={submitting} style={{marginRight: "4px"}} type='submit'>Submit</button>

            <button type="reset" onClick={() => {
                setImage(null);
                setTakenDate(null);
                setGuessItem("");
                setItemToUpload("");
            }}>Clear</button>

        </form>


        </div>}




    </div>);
}



export default UploadItem;