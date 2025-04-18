import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Load Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=GEMINI_API_KEY)

# Load model
model = genai.GenerativeModel("models/gemini-1.5-pro")

# FastAPI app setup
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"]
)

class NewsRequest(BaseModel):
    text: str
    title: str = ""

@app.post("/predict")
async def predict_news(news: NewsRequest):
    try:
        combined_text = f"{news.title} {news.text}" if news.title else news.text

        prompt = f"""
        Determine whether the following news article is FAKE or REAL.
        Only reply with one word: FAKE or REAL.

        Article:
        {combined_text}
        """

        response = await model.generate_content_async(prompt)

        print("Gemini Response:", response.text)

        result = response.text.strip().upper()

        if "FAKE" in result:
            prediction = "FAKE"
        elif "REAL" in result:
            prediction = "REAL"
        else:
            prediction = "UNKNOWN"

        return {"prediction": prediction}

    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail=str(e))
