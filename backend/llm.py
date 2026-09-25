import os

from dotenv import load_dotenv
from google import genai
from groq import Groq

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

gemini_client = (
    genai.Client(api_key=GEMINI_API_KEY)
    if GEMINI_API_KEY
    else None
)

groq_client = (
    Groq(api_key=GROQ_API_KEY)
    if GROQ_API_KEY
    else None
)


def generate_ai_response(prompt: str) -> str:

    # Try Gemini
    if gemini_client:
        try:
            response = gemini_client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=prompt,
            )

            if response.text:
                return response.text

        except Exception as e:
            print(f"Gemini unavailable: {e}")

    # Fallback to Groq
    if groq_client:
        try:
            response = groq_client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                max_tokens=1024,
            )

            content = response.choices[0].message.content

            if content:
                return content

        except Exception as e:
            print(f"Groq unavailable: {e}")

    raise RuntimeError(
        "All AI providers are currently unavailable."
    )