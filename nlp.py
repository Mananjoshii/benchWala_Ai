from fastapi import FastAPI
from pydantic import BaseModel
from ask_ai import predict_intent

app = FastAPI()

class TextRequest(BaseModel):
    text: str

@app.post("/predict")
def predict(req: TextRequest):
    try:
        intent, confidence = predict_intent(req.text)
        return {
            "intent": intent,
            "confidence": confidence
        }
    except Exception as e:
        return {"error": str(e)}