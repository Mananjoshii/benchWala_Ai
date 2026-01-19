import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os

MODEL_DIR = "exam_intent_model"

tokenizer = None
ai_model = None
labels = []

def load_model():
    global tokenizer, ai_model, labels

    if ai_model is not None:
        return

    # load labels
    with open(os.path.join(MODEL_DIR, "label_names.txt")) as f:
        labels = [line.strip() for line in f.readlines()]

    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
        ai_model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_DIR,
            num_labels=len(labels)
        )
        ai_model.eval()
        print("✅ AI model loaded successfully")

    except Exception as e:
        print("❌ Failed to load AI model:", e)
        ai_model = None


def predict_intent(text: str):
    load_model()

    if ai_model is None:
        raise Exception("AI model not loaded (missing model weights)")

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True
    )

    with torch.no_grad():
        outputs = ai_model(**inputs)

    logits = outputs.logits
    predicted_index = torch.argmax(logits, dim=1).item()

    return labels[predicted_index], torch.softmax(logits, dim=1)[0][predicted_index].item()