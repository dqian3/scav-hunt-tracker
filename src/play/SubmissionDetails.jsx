import React from 'react';


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

export default SubmissionDetails;