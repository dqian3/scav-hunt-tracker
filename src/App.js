import React, { useEffect, useState } from 'react';

import { db } from './firebase'

import { collection, getDocs, query, where, doc} from "firebase/firestore"; 

function App() {

  let [hunts, setHunts] = useState([]);
  let [players, setPlayers] = useState([]);
  let [items, setItems] = useState([]);

  let [curPlayer, setCurPlayer] = useState(localStorage.getItem("player") || "");
  let [curHunt, setCurHunt] = useState("");

  useEffect(() => {
    async function getData() {
      let results = await getDocs(collection(db, "players"));
      setPlayers(results.docs.map((doc) => doc.id));

      results = await getDocs(collection(db, "hunts"));
      setHunts(results.docs.map((doc) => doc.id));

      setCurHunt(results.docs[0]?.id);
    }
    getData();
  }, []);

  useEffect(() => {
    async function getItems() {
      let itemsRef = collection(db, "items");
      const huntRef = doc(db, "hunts", curHunt);
      const q = query(itemsRef, where("hunt", "==", huntRef));
      let results = await getDocs(q);

      setItems(results.docs.map(d => d.data()))
    }
    if (!curHunt) return; // Don't bother if no hunt selected
    getItems();
  }, [curHunt]);

  return (
    <div className="App">
      <h1>
        Scav Hunt Central
      </h1>

      <div>
        <h3>Upload item</h3>

        <form>
          What scavenger hunt? 
          <select 
            value={curHunt}
            onChange={e => setCurHunt(e.target.value)}
          >
            {hunts.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>

          Who are you: 
          <select
            value={curPlayer}
            // Set the current player AND save to local storage
            onChange={e => {setCurPlayer(e.target.value); localStorage.setItem("player", e.target.value)}}
          >
            {players.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>

          <br/>          
          <input name='image' type="file" accept="image/*" capture="environment">
          </input>

        </form>

        
        <table>
          <th>
            <td>Item</td>
            <td>{curPlayer}</td>
          </th>
          {
            items.map((item) => <tr>
              <td>{item["description"]}</td>
              {players.map((p) => <td key={p}>{p}</td>)}
            </tr>) 
          }

        </table>


      </div>

    </div>
  );
}

export default App;
