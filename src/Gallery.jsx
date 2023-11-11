import React from 'react';

import { useParams } from 'react-router-dom';

import { db } from './firebase'
import { collection, query, doc, orderBy, where} from "firebase/firestore";
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';

import moment from 'moment';


export default function Gallery() {
    let { huntId } = useParams();

    // State from firebase
    const huntRef = doc(db, "hunts", huntId);
    const playersRef = collection(db, "players");

    const itemsRef = collection(db, "hunts", huntId, "items");
    const itemsQuery = query(itemsRef, orderBy("author"));

    const submsRef = collection(db, "hunts", huntId, "submissions");
    const submsQuery = query(submsRef, where("active", "==", true));

    const [hunt, huntLoading, huntError] = useDocument(huntRef);
    const [players, playersLoading, playersError] = useCollection(playersRef);
    const [items, itemsLoading, itemsError] = useCollection(itemsQuery);
    const [subms, submsLoading, submsError] = useCollection(submsQuery);

    // Probably a better way to do this lol
    if (huntLoading || playersLoading || itemsLoading || submsLoading) {
        return <p>Loading</p>
    }

    if (huntError || playersError || itemsError || submsError) {
        return <p>Error!</p>
    }


    // TODO query database by item and do sorting there

    let submsTable = new Map(items.docs.map((item) => [item.ref.path, []]));
    subms.docs.forEach((s) => {
        // Since this returns a ref, we need to ask for .path
        submsTable.get(s.data().item.path).push([s.id, s.data()]);
    });

    submsTable.forEach((arr) => {
        console.log(arr)

        arr.sort(([_1, s1], [_2, s2]) => {
            return s1.takenTime.seconds - s2.takenTime.seconds;
        })
    })


    function imagesForItem(itemRef) {
        if (submsTable.get(itemRef).length === 0) {
            return <p> No submissions :( </p>
        }
        return submsTable.get(itemRef).map(([id, s]) =>
            <div style={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid",

            }}>
                <img
                    key={id}
                    loading="lazy"
                    src={s.image}
                    height={200}
                />
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                }}>
                    <b>{s.player.id}</b>
                    &nbsp;
                    ({moment(new Date(s.takenTime.seconds * 1000)).format("MMM D")})
                </div>
            </div>
        )
    }


    return <div>
        <h1>
            {hunt.data().displayName} Gallery:
        </h1>

        {
            items.docs.map((item) =>
                <div key={item.id}>
                    <h3>
                        {item.data().desc}
                    </h3>

                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        flexFlow: "row wrap",
                        gap: "10px",
                    }}>
                    {
                        imagesForItem(item.ref.path)
                    }

                    </div>
                </div>
            )

        }
    </div>

}
