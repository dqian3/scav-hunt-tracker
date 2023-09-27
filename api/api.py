from transformers import AutoProcessor, AutoModelForZeroShotImageClassification
import torch

from PIL import Image
from io import BytesIO
import base64

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from pydantic import BaseModel

class ImageTask(BaseModel):
    image: str
    labels: list[str]

checkpoint = "openai/clip-vit-large-patch14"
processor = AutoProcessor.from_pretrained(checkpoint)
model = AutoModelForZeroShotImageClassification.from_pretrained(checkpoint)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/guess_label")
def guess_label(task: ImageTask):
    
    print(task.image)
    image = Image.open(BytesIO(base64.b64decode(task.image)))
    inputs = processor(images=image, text=task.labels, return_tensors="pt", padding=True)

    with torch.no_grad():
        outputs = model(**inputs)

    logits = outputs.logits_per_image[0]
    probs = logits.softmax(dim=-1).numpy()
    scores = probs.tolist()

    result = [
        {"score": score, "label": candidate_label}
        for score, candidate_label in sorted(zip(scores, task.labels), key=lambda x: -x[0])
    ]

    print(result)
    return result