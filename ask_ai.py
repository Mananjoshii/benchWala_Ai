import torch
import torch.nn.functional as F
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import os
AI_MODEL_PATH = "./exam_intent_model"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

try:
    ai_tokenizer = DistilBertTokenizerFast.from_pretrained(AI_MODEL_PATH)
    ai_model = DistilBertForSequenceClassification.from_pretrained(AI_MODEL_PATH)
    ai_model.to(device)
    ai_model.eval()

    # Load label names (correct indexing)
    with open(os.path.join(AI_MODEL_PATH, "label_names.txt"), "r") as f:
        AI_LABELS = [line.strip() for line in f.readlines()]

    print("AI Model Loaded Successfully.")

except Exception as e:
    print("Failed to load AI model:", e)
    AI_LABELS = []

def predict_intent(text):
    inputs = ai_tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = ai_model(**inputs)
        probs = F.softmax(outputs.logits, dim=-1)

        confidence, pred_idx = torch.max(probs, dim=-1)

    intent = AI_LABELS[pred_idx.item()]
    confidence = confidence.item()

    return intent, confidence
