import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";

import { db } from './firebase'


import { convertBase64, classifyImage } from './classify';

// Todo update stuff in general

export default function Play() {
    let { huntId } = useParams();

    // State from firebase
    let [hunt, setHunt] = useState({});
    let [items, setItems] = useState([]);
    let [submissions, setSubmissions] = useState([]);

    let [players, setPlayers] = useState([]);

    // Form state
    let [image, setImage] = useState(null);
    let [imageObjURL, setImageObjURL] = useState("");

    // Feedback state
    let [guessItem, setGuessItem] = useState("");

    useEffect(() => {
        async function getData() {
            const hunt = await getDoc(doc(db, "hunts", huntId));
            setHunt(hunt.data());

            const items = await getDocs(collection(db, "hunts", huntId, "items"));
            setItems(Object.fromEntries(items.docs.map((item) => [item.id, item.data()])));

            const submissions = await getDocs(collection(db, "hunts", huntId, "submissions"));
            setSubmissions(Object.fromEntries(submissions.docs.map((s) => [s.id, s.data()])));
        }
        getData();
    }, []);


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

                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            Object.values(items).map((item) => <tr key={item.desc}>
                                <td>{item.desc}</td>
                            </tr>)
                        }
                    </tbody>
                </table>


            </div>

        </div>
    );
}
