import os
from dotenv import load_dotenv
import openai
from flask import Flask, request, jsonify
from bs4 import BeautifulSoup
from lesson_generator_prompts.llm_coach_prompt import llm_coach_prompt_generator
from flask_cors import CORS

load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

app = Flask(__name__)
CORS(app)

def extract_metadata_and_content(html: str):
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.string.strip() if soup.title else "Untitled"
    description_tag = soup.find("meta", attrs={"name": "description"})
    keywords_tag = soup.find("meta", attrs={"name": "keywords"})
    description = description_tag["content"].strip() if description_tag and description_tag.has_attr("content") else ""
    keywords = keywords_tag["content"].strip() if keywords_tag and keywords_tag.has_attr("content") else ""
    for tag in soup(["script", "style", "noscript", "header", "footer", "nav", "aside", "form", "svg", "iframe"]):
        tag.decompose()
    text = soup.get_text(separator="\n", strip=True)
    return {
        "metadata": {
            "title": title,
            "description": description,
            "keywords": keywords,
        },
        "mainContent": text
    }
    
@app.route("/", methods=["GET"])
def test():
    lesson_plan = 'lesson plan test'
    return jsonify({"test": lesson_plan})

@app.route("/api/process-content", methods=["POST"])
def process_content():
    data = request.json
    mainContent = data.get("mainContent", "")
    if not mainContent:
        return jsonify({"error": "No content provided"}), 400
    content = extract_metadata_and_content(mainContent)
    title = content["metadata"]["title"]
    main_content = content["mainContent"]
    prompt = llm_coach_prompt_generator(title, main_content)
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are an experienced educator creating detailed lesson plans."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        lesson_plan = response.choices[0].message.content
        return jsonify({"lesson_plan": lesson_plan})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)



