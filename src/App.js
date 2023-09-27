import React, { useEffect, useState } from 'react';

import { db } from './firebase'

import { collection, getDocs, doc, updateDoc} from "firebase/firestore"; 

// Todo update stuff in general

async function classifyImage(image, labels) {
  const response = await fetch("http://localhost:8000/guess_label", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image,
      labels
    })
  });
  const answer = await response.json();

  return answer;
}

async function convertBase64(file){
  /// this feels gross, but it's what stackoverflow says to do
  return await new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file)
    fileReader.onload = () => {
      let encoded = fileReader.result.toString().replace(/^data:(.*,)?/, '');
      resolve(encoded);
    }
    fileReader.onerror = (error) => {
      reject(error);
    }
  })
}



function EditHunt({curHunt}) {
  const [items, setItems] = useState("");

  console.log(curHunt)
  async function handleSubmit(e) {
    e.preventDefault();

    const huntRef = doc(db, "hunts", curHunt);
    await updateDoc(huntRef, {
      items: items.split("\n").map((item) => ({
        description: item.trim()
      }))
    });
  }

  return <form onSubmit={handleSubmit}> 
    <h3>Set items</h3>

    <p>Items, separated by line</p>
    <textarea value={items} onChange={(e) => setItems(e.target.value)}/>

    <br/>
    <button type="submit">Submit</button>
  </form>


}

function App() {
  // State from firebase
  let [hunts, setHunts] = useState({});
  let [players, setPlayers] = useState([]);

  // Form state
  let [curPlayer, setCurPlayer] = useState(localStorage.getItem("player") || "");
  let [curHunt, setCurHunt] = useState(localStorage.getItem("hunt") || "");

  let [image, setImage] = useState(null);
  let [imageObjURL, setImageObjURL] = useState("");

  let [guessItem, setGuessItem] = useState("");

  useEffect(() => {
    async function getData() {
      let results = await getDocs(collection(db, "players"));
      setPlayers(results.docs.map((doc) => doc.id));

      results = await getDocs(collection(db, "hunts"));
      setHunts(Object.fromEntries(results.docs.map((doc) => [doc.id, doc.data()])));
    }
    getData();
  }, []);


  function handleChangeImage (e) {
    setImage(e.target.files[0]);
    setImageObjURL(URL.createObjectURL(e.target.files[0]))
  };


  // TODO make this a better handler
  async function handleGuess (){
    const labels = hunts[curHunt].items.map((item) => item.description);
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
    <div className="App">
      <h1>
        Scav Hunt Central
      </h1>

      <div>

        <p>
          What scavenger hunt? 
          <select 
            value={curHunt}
            onChange={(e) => {setCurHunt(e.target.value); localStorage.setItem("hunt", e.target.value)}}
          >
            <option value={""}>Select...</option>
            {Object.keys(hunts).map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </p>

        <p>
          Who are you: 
          <select
            value={curPlayer}
            // Set the current player AND save to local storage
            onChange={e => {setCurPlayer(e.target.value); localStorage.setItem("player", e.target.value)}}
          >
            {players.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </p>

        {
          (curHunt !== "" && hunts[curHunt]?.items.length === 0) &&
          <EditHunt curHunt={curHunt}></EditHunt>
        }

        <h3>Upload item</h3>

        <form>
          <img alt="pending image" height={200} src={imageObjURL}/>
          <br/>          
          <input name='image' type="file" accept="image/*" capture="environment" onChange={handleChangeImage}>
          </input>
          <br/>
          <h4>{guessItem}</h4>
          
        </form>

        <br/>
        <hr/>
        <br/>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>{curPlayer}</th>
            </tr>
          </thead>

          <tbody>
          {
            hunts[curHunt]?.items.map((item) => <tr key={item["description"]}>
              <td>{item["description"]}</td>
              <td>Upload</td>
            </tr>) 
          }
          </tbody>
        </table>


      </div>

    </div>
  );
}


export default App;
