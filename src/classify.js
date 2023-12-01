async function classifyImage(image, labels) {
    const data = new FormData();

    data.set("image", image);
    data.set("labels", JSON.stringify(labels)); // JSON encoded

    const response = await fetch(process.env.REACT_APP_API_URL  + "/guess_label", {
        method: "POST",
        body: data
    });
    const answer = await response.json();

    return answer;
}

export { classifyImage }