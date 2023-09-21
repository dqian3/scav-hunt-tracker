import React, { useEffect, useState } from 'react';

import { db } from './firebase'

import { collection, getDocs, query, where, doc} from "firebase/firestore"; 

function App() {

  let [hunts, setHunts] = useState([]);
  let [players, setPlayers] = useState([]);

  let [curPlayer, setCurPlayer] = useState(localStorage.getItem("player") || "");
  let [curHunt, setCurHunt] = useState(0);

  useEffect(() => {
    async function getData() {
      let results = await getDocs(collection(db, "players"));
      setPlayers(results.docs.map((doc) => doc.id));

      results = await getDocs(collection(db, "hunts"));
      setHunts(results.docs);

      console.log(results.docs.at(0).data())
    }
    getData();
  }, []);

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
            onChange={(e) => e.setCurHunt(e.target.value)}
          >
            {hunts.map((h, i) => <option key={h.id} value={i}>{h.id}</option>)}
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
          <thead>
            <tr>
              <th>Item</th>
              <th>{curPlayer}</th>
            </tr>
          </thead>

          <tbody>
          {
            hunts[curHunt]?.data().items.map((item) => <tr key={item["description"]}>
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
