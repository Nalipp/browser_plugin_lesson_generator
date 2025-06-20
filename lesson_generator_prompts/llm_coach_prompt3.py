
def llm_coach_prompt_generator(title: str, main_content: str) -> str:
    return f"""
You are a language coach. Your task is to generate a speaking-focused English lesson plan based on the article content provided below.

---

## Content  
Title: {title}  
Text: {main_content}

---

## Objective

Design a lesson that helps students practice speaking English in a 1:1 or group conversation with a teacher or peer.

- Assume the student has NOT read the article — avoid references like “as mentioned above” or “you read about…”.
- The content should be engaging, informal, and suitable for intermediate learners (CEFR B1–B2).
- Use natural, real-life expressions — aim for fluency and confidence, not textbook repetition.

---

## Format

Return a single valid JSON object with the following keys.  
Do not include Markdown, explanations, or comments — just the JSON.

---

### Notes on "common_expressions"

This is the **most important** part of the lesson. Always include it.  
It should be a list of 5 short idioms, expressions, or conversational phrases commonly used by native English speakers.

Each item must include:
- The phrase
- A short, plain-English explanation of its meaning (do not use technical grammar terms)

These should reflect **natural, everyday speech**, not academic textbook phrases.

**Example:**

"Night owl: Someone who stays up late and wakes up later in the day."  
"Early bird: Someone who goes to bed early and wakes up early."  
"Sleep cycle: The pattern of sleep and wakefulness during a 24-hour period."  
"Adjust your sleep schedule: Change the times you go to bed and wake up to match a desired routine."  
"Sleep hygiene: Habits and practices that promote good quality sleep."

---

### Expected JSON Format:

{{
  "title": "...",
  "common_expressions": [
    "...",
    "...",
    "...",
    "...",
    "..."
  ],
  "intro": "...",
  "initial_question": "...",
  "questions": [
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "..."
  ],
  "more_substantial_discussion_topics": [
    "...",
    "...",
    "...",
    "...",
    "...",
    "..."
  ],
  "summary": "..."
}}
"""
