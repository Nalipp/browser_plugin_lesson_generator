import os
from dotenv import load_dotenv
import openai
from bs4 import BeautifulSoup
from typing import Dict, Any
from html_scrapes.best_vacation_destinations import best_vacation_destinations_scrape
from lesson_generator_prompts.llm_coach_prompt import llm_coach_prompt_generator


load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

def extract_metadata_and_content(html: str) -> Dict[str, Any]:
    """
    Extract metadata and main content from raw HTML using BeautifulSoup.
    """
    soup = BeautifulSoup(html, "html.parser")

    # Extract metadata
    title = soup.title.string.strip() if soup.title else "Untitled"
    description_tag = soup.find("meta", attrs={"name": "description"})
    keywords_tag = soup.find("meta", attrs={"name": "keywords"})
    author_tag = soup.find("meta", attrs={"name": "author"})

    description = description_tag["content"].strip() if description_tag and description_tag.has_attr("content") else ""
    keywords = keywords_tag["content"].strip() if keywords_tag and keywords_tag.has_attr("content") else ""

    # Remove scripts/styles and unnecessary elements
    for tag in soup(["script", "style", "noscript", "header", "footer", "nav", "aside", "form", "svg", "iframe"]):
        tag.decompose()

    # Extract main content as text
    text = soup.get_text(separator="\n", strip=True)

    out = {
        "metadata": {
            "title": title,
            "description": description,
            "keywords": keywords,
        },
        "mainContent": text
    }

    return out


def generate_lesson_plan(content: Dict[str, Any]) -> str:
    """
    Generate a lesson plan based on the cleaned content using OpenAI.
    """
    title = content.get('metadata', {}).get('title', '')
    main_content = content.get('mainContent', '')

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
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating lesson plan: {str(e)}")
        raise

def main():
    try:
        print("Processing HTML content...")
        content = extract_metadata_and_content(best_vacation_destinations_scrape)
        print("initial content metadata dict...", content['metadata'])
        print("Generating lesson plan...")
        lesson_plan = generate_lesson_plan(content)
        print("\nGenerated Lesson Plan:")
        print("=" * 80)
        print(lesson_plan)
        print("=" * 80)
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
