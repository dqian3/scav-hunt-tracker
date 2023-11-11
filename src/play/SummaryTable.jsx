import React from 'react';

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


export default SummaryTable;