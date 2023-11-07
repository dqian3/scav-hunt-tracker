
from transformers import AutoProcessor, AutoModelForZeroShotImageClassification
import torch

class ZSClassifier():
    def __init__(self):
        pass

    def classify(self, image, labels):
        pass


class ClipZSClassifier(ZSClassifier):
    # Make these class variables, so it can be shared
    checkpoint = "openai/clip-vit-base-patch32"
    processor = AutoProcessor.from_pretrained(checkpoint)
    model = AutoModelForZeroShotImageClassification.from_pretrained(checkpoint)

    def __init__(self):
        super().__init__()


    # Given a PIL image and list of potential labels, return a list of classifcations with
    # the score
    def classify(self, image, labels):
        x = self.processor(images=image, text=labels, return_tensors="pt", padding=True)

        with torch.no_grad():
            outputs = self.model(**x)

        logits = outputs.logits_per_image[0]
        probs = logits.softmax(dim=-1).numpy()
        scores = probs.tolist()

        result = [
            {"score": score, "label": candidate_label}
            for score, candidate_label in sorted(zip(scores, labels), key=lambda x: -x[0])
        ]
        return result