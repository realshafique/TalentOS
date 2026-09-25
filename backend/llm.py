import json
import os

from dotenv import load_dotenv
from google import genai
from groq import Groq

load_dotenv()


# =========================================================
# API CLIENTS
# =========================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


gemini_client = None
groq_client = None


if GEMINI_API_KEY:
    gemini_client = genai.Client(
        api_key=GEMINI_API_KEY
    )


if GROQ_API_KEY:
    groq_client = Groq(
        api_key=GROQ_API_KEY
    )


# =========================================================
# MODELS
# =========================================================

GEMINI_MODEL = "gemini-3.5-flash-lite"

GROQ_MODEL = "openai/gpt-oss-20b"


# =========================================================
# PROMPT BUILDER
# =========================================================

def build_recommendation_prompt(
    query: str,
    profiles: list
) -> str:

    profiles_text = json.dumps(
        profiles,
        indent=2,
        ensure_ascii=False
    )

    return f"""
You are the AI recommendation engine for TalentOS,
a university talent discovery and team formation platform.

A user has submitted this requirement:

"{query}"

Below are the candidate profiles retrieved from the
TalentOS semantic search system:

{profiles_text}


Your task is to analyze how each candidate aligns with
the user's requirement.

IMPORTANT RULES:

1. Use ONLY information explicitly present in the profiles.

2. Do NOT invent skills, projects, experience, interests,
   availability, achievements, or technologies.

3. Do NOT assume that someone has a skill simply because
   of their degree or academic year.

4. Semantic similarity is only an indication of relevance.
   It is NOT proof that the candidate has a particular skill.

5. If information is missing, say "Not specified".

6. Do not use rankings such as:
   - Best
   - Worst
   - #1
   - #2
   - Winner

7. Use match levels only to describe alignment with the
   specific requirement:
   - Strong
   - Moderate
   - Relevant

8. Be concise but useful.

9. Explain what the candidate could potentially contribute
   based only on their documented profile.

10. Identify skills covered across the retrieved candidates.

11. Identify potential skill gaps only when the requirement
    indicates a skill that is not clearly represented.

12. Return ONLY valid JSON.

Use exactly this structure:

{{
    "requirement_summary": "Short summary of the user's requirement",

    "candidate_analysis": [
        {{
            "profile_id": 0,
            "name": "Candidate name",
            "match_level": "Strong",
            "skill_alignment": "Explain relevant documented skills",
            "experience_relevance": "Explain relevant documented projects/profile information",
            "availability": "Candidate availability",
            "why_match": "Explain the alignment with the requirement",
            "potential_contribution": "Explain what the candidate could contribute"
        }}
    ],

    "skill_coverage": [
        "Skill or capability represented among candidates"
    ],

    "potential_skill_gaps": [
        "Skill that appears to be missing or insufficiently represented"
    ],

    "team_insight": "Short explanation of how the retrieved candidates collectively relate to the requirement"
}}
"""


# =========================================================
# JSON CLEANER
# =========================================================

def clean_json_response(response_text: str):

    if not response_text:
        raise ValueError("LLM returned an empty response.")

    response_text = response_text.strip()

    # Remove markdown code fences if the model added them
    if response_text.startswith("```"):
        lines = response_text.splitlines()

        if lines:
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        response_text = "\n".join(lines).strip()

    try:
        return json.loads(response_text)

    except json.JSONDecodeError:

        # Try extracting the JSON object
        start = response_text.find("{")
        end = response_text.rfind("}")

        if start != -1 and end != -1:
            json_text = response_text[start:end + 1]

            try:
                return json.loads(json_text)
            except json.JSONDecodeError:
                pass

        raise ValueError(
            "LLM returned invalid JSON."
        )


# =========================================================
# GEMINI
# =========================================================

def generate_with_gemini(prompt: str):

    if not gemini_client:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    response = gemini_client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt
    )

    if not response or not response.text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    return clean_json_response(
        response.text
    )


# =========================================================
# GROQ
# =========================================================

def generate_with_groq(prompt: str):

    if not groq_client:
        raise RuntimeError(
            "GROQ_API_KEY is not configured."
        )

    response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a structured AI recommendation "
                    "engine. Return only valid JSON."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=2000
    )

    if (
        not response
        or not response.choices
        or not response.choices[0].message
    ):
        raise RuntimeError(
            "Groq returned an empty response."
        )

    content = response.choices[0].message.content

    return clean_json_response(
        content
    )


# =========================================================
# AI RECOMMENDATION
# =========================================================

def generate_ai_recommendation(
    query: str,
    profiles: list
):

    prompt = build_recommendation_prompt(
        query,
        profiles
    )

    # -----------------------------------------------------
    # Try Gemini first
    # -----------------------------------------------------

    if gemini_client:

        try:
            print("Trying Gemini for AI recommendation...")

            return generate_with_gemini(
                prompt
            )

        except Exception as e:

            print(
                f"Gemini recommendation failed: "
                f"{type(e).__name__}: {e}"
            )

    # -----------------------------------------------------
    # Try Groq fallback
    # -----------------------------------------------------

    if groq_client:

        try:
            print("Trying Groq fallback...")

            return generate_with_groq(
                prompt
            )

        except Exception as e:

            print(
                f"Groq recommendation failed: "
                f"{type(e).__name__}: {e}"
            )

    # -----------------------------------------------------
    # Both unavailable
    # -----------------------------------------------------

    return {
        "requirement_summary": query,

        "candidate_analysis": [],

        "skill_coverage": [],

        "potential_skill_gaps": [],

        "team_insight": (
            "AI recommendation services are currently "
            "unavailable. Please try again later."
        )
    }


# =========================================================
# SIMPLE AI RESPONSE
# =========================================================

def generate_ai_response(prompt: str):

    # Gemini
    if gemini_client:

        try:

            response = gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt
            )

            if response and response.text:
                return response.text.strip()

        except Exception as e:

            print(
                f"Gemini response failed: "
                f"{type(e).__name__}: {e}"
            )

    # Groq fallback
    if groq_client:

        try:

            response = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=2000
            )

            if response and response.choices:

                return (
                    response
                    .choices[0]
                    .message
                    .content
                    .strip()
                )

        except Exception as e:

            print(
                f"Groq response failed: "
                f"{type(e).__name__}: {e}"
            )

    return (
        "AI services are currently unavailable."
    )