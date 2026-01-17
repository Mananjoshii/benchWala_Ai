from fastapi import FastAPI
from pydantic import BaseModel
from ask_ai import predict_intent

app = FastAPI()

class AIRequest(BaseModel):
    text: str

class AIResponse(BaseModel):
    intent: str
    confidence: float

@app.post("/predict", response_model=AIResponse)
def predict(req: AIRequest):
    intent, confidence = predict_intent(req.text)
    return {
        "intent": intent,
        "confidence": confidence
    }
