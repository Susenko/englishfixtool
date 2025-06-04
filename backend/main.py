from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os
import logging
from fastapi.middleware.cors import CORSMiddleware

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Логер
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("/app/uvicorn.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class NativeLikeRequest(BaseModel):
    text: str

@app.post("/nativelike")
def analyze_native_like(data: NativeLikeRequest):
    logger.info("➡️  Отримано запит на /nativelike")
    logger.info(f"📩 Введений текст: {data.text}")

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{
                "role": "user",
                "content": f"""
Проаналізуй речення англійською: "{data.text}"

1. Чи правильне воно граматично/лексично?
2. Якщо ні — як це сприймається на слух (українською), як би це "звучало" від не-нейтива?

Відповідай у JSON:
{{
  "is_correct": true/false,
  "native_perception": "..."
}}
                """
            }],
            temperature=0.3,
        )

        content = response.choices[0].message.content
        logger.info(f"✅ Відповідь від OpenAI: {content}")

        return {
            "is_correct": False,  # тимчасово
            "native_perception": content
        }

    except Exception as e:
        logger.error(f"❌ Помилка при запиті до OpenAI: {str(e)}")
        return {
            "is_correct": False,
            "native_perception": "Виникла помилка при аналізі тексту.",
            "error": str(e)
        }
