import torch

from PIL import Image
from io import BytesIO
import base64

from fastapi import FastAPI, UploadFile, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from classifier import ClipZSClassifier
from converter import convert_heic

from pydantic import BaseModel

class ImageTask(BaseModel):
    image: str
    labels: list[str]

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    "https://scav-hunt-tracker.onrender.com",
    "https://scavhunt.danqian.net",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = ClipZSClassifier()

@app.post("/guess_label")
def guess_label(task: ImageTask):
    image = Image.open(BytesIO(base64.b64decode(task.image)))
    return classifier.classify(image, task.labels)


@app.post("/guess_label")
def guess_label(file: UploadFile):
    return StreamingResponse(convert_heic(file), media_type="image/jpeg")