from PIL import Image
import json
import io

from typing import Annotated
from fastapi import FastAPI, Form, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from classifier import ClipZSClassifier
from converter import heic_to_jpg


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
def guess_label(
    image: Annotated[bytes, File()],
    labels: Annotated[str, Form()]
):
    image = Image.open(io.BytesIO(image))
    labels = json.loads(labels)

    return classifier.classify(image, labels)


@app.post("/convert_heic")
def convert(image: Annotated[bytes, File()]):
    out_bytes = heic_to_jpg(image)
    return Response(content=out_bytes, media_type="image/jpeg")