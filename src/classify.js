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

async function convertBase64(file) {
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

export { classifyImage, convertBase64 }