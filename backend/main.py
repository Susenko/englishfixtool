from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import os
import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from fastapi.responses import JSONResponse
import logging
import json
import re



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

PHRASES_FILE = "data/user_phrases.json"

class PhraseRequest(BaseModel):
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
                        "Використовуй такі фрази, що мають закінчений смисл і можуть бути використані окремо."
                        "Роби це наче це токенізація тексту, але з фокусом на короткі фрази, які відображають суть думок користувача."
                        
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

@app.get("/phrases-file-json")
def get_phrases_json():
    try:
        with open("data/user_phrases.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            return JSONResponse(content=data)
    except Exception as e:
        logging.error(f"❌ Error reading user_phrases.json: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/analyze-and-append")
def analyze_and_append(data: PhraseRequest):
    user_text = data.text.strip()
    logging.info(f"📩 User input: {user_text}")

    try:
        prompt = f"""
        You're a language assistant. Analyze this sentence:
        "{user_text}"

        Return only valid JSON in this structure:

        {{
          "original": "...",
          "fixed": "...",
          "issue": "...",
          "issues": {{
            "Articles": 0,
            "WordOrder": 0,
            "VerbTenses": 0,
            "SubjectVerbAgreement": 0,
            "Prepositions": 0,
            "WordChoice": 0,
            "QuestionFormation": 0,
            "BusinessTone": 0,
            "SentenceFlow": 0,
            "Spelling": 0
          }}
        }}

        No comments, no explanation — only JSON.
        """

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )

        raw = response.choices[0].message.content.strip()
        logging.info("📦 Raw GPT response:\n" + raw)

        # DEBUG: print all characters with their indexes
        for idx, char in enumerate(raw):
            logging.debug(f"[{idx}] {repr(char)}")

        # Try naive parse first
        try:
            parsed = json.loads(raw)
            logging.info(f"✅ JSON loaded directly")
        except json.JSONDecodeError as e:
            logging.warning(f"⚠️ Direct parse failed: {e}")
            logging.warning("🔍 Trying regex-based extraction...")

            # Try extracting first JSON block
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if not match:
                raise ValueError("🛑 Could not find JSON block with regex!")

            raw_json = match.group()
            logging.info("🔧 Extracted JSON block:\n" + raw_json)

            parsed = json.loads(raw_json)
            logging.info("✅ JSON loaded from extracted block")


        # Step 4: Добавить в user_phrases.json
        try:
            logging.debug(f"📂 Trying to open {PHRASES_FILE} for reading...")
            with open("data/user_phrases.json", "r", encoding="utf-8") as f:
                phrases = json.load(f)
                logging.debug(f"📄 Current content in file ({len(phrases)} phrases): {phrases[:1]}")
        except FileNotFoundError:
            logging.warning(f"📁 {PHRASES_FILE} not found. Creating new list.")
            phrases = []
        except json.JSONDecodeError as e:
            logging.error(f"❌ Failed to parse JSON from {PHRASES_FILE}: {e}")
            phrases = []

        # Insert new phrase
        logging.debug("➕ Inserting new parsed entry at the top of the list.")
        phrases.insert(0, parsed)

        try:
            logging.debug(f"💾 Writing {len(phrases)} total phrases back to {PHRASES_FILE}...")
            with open(PHRASES_FILE, "w", encoding="utf-8") as f:
                json.dump(phrases, f, indent=2, ensure_ascii=False)
            logging.info("✅ Saved successfully to user_phrases.json")
        except Exception as e:
            logging.error(f"❌ Failed to write to {PHRASES_FILE}: {e}")
            raise
                # Step 5: Update statistics.json
        try:
            with open("data/statistics.json", "r", encoding="utf-8") as f:
                stats = json.load(f)
            logging.info("📊 Loaded existing statistics.json")
        except FileNotFoundError:
            stats = {key: 0 for key in parsed["issues"].keys()}
            logging.info("📊 Created new statistics.json")

        # Сума по кожній категорії
        for key, value in parsed["issues"].items():
            stats[key] = stats.get(key, 0) + value

        with open("data/statistics.json", "w", encoding="utf-8") as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)

        logging.info("✅ Updated statistics.json")

        # Save as usual
        return {"success": True, "entry": parsed}

    except Exception as e:
        logging.error(f"❌ Final error: {str(e)}")
        return {"success": False, "error": str(e)}




@app.get("/statistics")
def get_statistics():
    try:
        with open("data/statistics.json", "r", encoding="utf-8") as f:
            stats = json.load(f)
        return JSONResponse(content=stats)
    except Exception as e:
        logging.error(f"❌ Failed to load statistics: {e}")
        return JSONResponse(content={"error": "Could not load statistics"}, status_code=500)        