import { collection, getDocs } from "firebase/firestore"; 

const querySnapshot = await getDocs(collection(db, "hunts"));
querySnapshot.forEach((doc) => {
  console.log(`${doc.id} => ${doc.data()}`);
});

function App() {
  return (
    <div className="App">
      <header className="Scav Hunt">

      </header>
    </div>
  );
}

export default App;
