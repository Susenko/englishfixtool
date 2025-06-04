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

class ThoughtsRequest(BaseModel):
    text: str

@app.post("/thoughts-dictionary")
def extract_thought_blocks(data: ThoughtsRequest):
    user_text = data.text
    logging.info(f"🧠 Текст для словника думок: {user_text}")

    try:
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Витягуй з користувацького тексту 10 дуже коротких англійських фраз (2-6 слів), які відображають основні думки, дії чи стани користувача."
                        "Фрази не обов'язково мають бути точними цитатами — головне, щоб вони були близькими за змістом до того, що користувач описує."
                        "До кожної англійської фрази додай переклад українською. "
                        "Поверни результат у форматі JSON-списку об'єктів: [{\"en\": \"phrase\", \"uk\": \"переклад\"}, ...]"
                    )
                },
                {
                    "role": "user",
                    "content": data.text
                }
            ],
            temperature=0.3,
        )


        # Пробуем распарсить контент
        content = response.choices[0].message.content.strip()
        logging.info(f"✅ Отримані блоки: {content}")

        return {
            "phrases": content
        }

    except Exception as e:
        logging.error(f"❌ Помилка у ChatCompletion: {e}")
        return {
            "phrases": [],
            "error": str(e)
        }

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
