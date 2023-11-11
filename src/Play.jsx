import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { collection, query, doc, orderBy, where} from "firebase/firestore";
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';

import { db } from './firebase'

import UploadItem from './play/UploadItem';
import SummaryTable from './play/SummaryTable';
import SubmissionDetails from './play/SubmissionDetails';


export default function Play() {
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

    const [curSubDetails, setCurSubDetails] = useState(null);

    // Allow for editing of hunt after hunt is over
    const [editOverride, setEditOverride] = useState(false);

    // Probably a better way to do this lol
    if (huntLoading || playersLoading || itemsLoading || submsLoading) {
        return <p>Loading</p>
    }

    if (huntError || playersError || itemsError || submsError) {
        return <p>Error!</p>
    }

    const startDate = new Date(hunt.data().startDate.seconds * 1000);
    const endDate = new Date(hunt.data().endDate.seconds * 1000);
    const now = Date.now();

    return (
    <div>
        <h1 style={{
            marginBottom: "5px"
        }}>
            {hunt.data().displayName}
        </h1>

        <div style={{
            marginBottom: "0.67em"

        }}>
            <Link to={"/gallery/" + huntId}>View Gallery</Link>
        </div>

        <div>

            {/* { now  < startDate && !editOverride
                ? (
                    <p>The hunt has not started yet! Click <a href="#" onClick={() => setEditOverride(true)}>here</a> to upload items anyways!</p>
                )
                : (
                    now > endDate && ! editOverride
                        ? <p>The hunt is now finished! Click <a href="#" onClick={() => setEditOverride(true)}>here</a> to upload items anyways! </p>
                        : <UploadItem huntId={huntId} items={items}></UploadItem>
                )
            } */}

            <UploadItem huntId={huntId} items={items}></UploadItem>

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
