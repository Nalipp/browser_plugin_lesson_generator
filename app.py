import os
import openai
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("RENDER_DBNAME"),
        user=os.getenv("RENDER_USER"),
        password=os.getenv("RENDER_PASSWORD"),
        host=os.getenv("RENDER_HOST"),
        port=5432,
        cursor_factory=RealDictCursor
    )

from bs4 import BeautifulSoup
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
import stripe
import json



from lesson_generator_prompts.llm_coach_prompt2 import llm_coach_prompt_generator

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
# stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
stripe.api_key = os.getenv("STRIPE_SECRET_KEY_TEST")
# STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET_TEST")

app = Flask(__name__)
CORS(app, origins=["chrome-extension://hmoamkjgdbnoehccpmgdmdpnfpmffbia", "https://saturday-topics-landing.onrender.com", "https://browser-plugin-lesson-generator.onrender.com", "http://localhost:5001"])


def extract_metadata_and_content(html: str):
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.string.strip() if soup.title else "Untitled"
    description_tag = soup.find("meta", attrs={"name": "description"})
    keywords_tag = soup.find("meta", attrs={"name": "keywords"})
    description = (
        description_tag["content"].strip()
        if description_tag and description_tag.has_attr("content")
        else ""
    )
    keywords = (
        keywords_tag["content"].strip()
        if keywords_tag and keywords_tag.has_attr("content")
        else ""
    )
    for tag in soup(
        [
            "script",
            "style",
            "noscript",
            "header",
            "footer",
            "nav",
            "aside",
            "form",
            "svg",
            "iframe",
        ]
    ):
        tag.decompose()
    text = soup.get_text(separator="\n", strip=True)
    return {
        "metadata": {
            "title": title,
            "description": description,
            "keywords": keywords,
        },
        "mainContent": text,
    }


@app.route("/", methods=["GET"])
def test():
    lesson_plan = "lesson plan test"
    return jsonify({"test": lesson_plan})


@app.route("/api/process-content", methods=["POST"])
def process_content():
    data = request.json
    mainContent = data.get("mainContent", "")
    if not mainContent:
        return jsonify({"error": "Unable to parse content"}), 400
    content = extract_metadata_and_content(mainContent)
    title = content["metadata"]["title"]
    main_content = content["mainContent"]
    prompt = llm_coach_prompt_generator(title, main_content)
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4.1-nano-2025-04-14",
            messages=[
                {
                    "role": "system",
                    "content": "You are an experienced educator creating detailed lesson plans.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=2000,
        )
        lesson_plan = response.choices[0].message.content
        return jsonify({"lesson_plan": lesson_plan})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/stripe-webhook", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError as e:
        return jsonify({"error": "Invalid signature"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        session_id = session.get("id")
        starting_credits = 15
        new_key = secrets.token_urlsafe(24)

        try:
            conn = get_db_connection()
            with conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "INSERT INTO api_keys (key, credits, session_id) VALUES (%s, %s, %s)",
                        (new_key, starting_credits, session_id)
                    )
            conn.close()
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"status": "success"}), 200


@app.route("/api/check-credits", methods=["POST"])
def check_credits():
    """
    - Receives an API key in the request body.
    - Looks up the key in the database.
    - Returns the number of credits remaining for that key.
    """
    data = request.json
    api_key = data.get("key")
    if not api_key:
        return jsonify({"error": "No key provided"}), 400
    try:
        conn = get_db_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT credits FROM api_keys WHERE key = %s", (api_key,))
                row = cur.fetchone()
        conn.close()
        if row:
            return jsonify({"credits": row["credits"]})
        else:
            return jsonify({"credits": -1})  # Not found
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/get-api-key", methods=["POST"])
def get_api_key():
    """
    - Receives a Stripe session_id in the request body.
    - Looks up the API key associated with that session_id in the database.
    - Returns the API key if found.
    """
    data = request.json
    session_id = data.get("session_id")
    if not session_id:
        return jsonify({"error": "No session_id provided"}), 400

    try:
        conn = get_db_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT key FROM api_keys WHERE session_id = %s", (session_id,))
                row = cur.fetchone()
        conn.close()

        if row:
            return jsonify({"key": row["key"]})
        else:
            return jsonify({"key": None})  # Not found
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/redeem-credit", methods=["POST"])
def redeem_credit():
    """
    - Receives an API key in the request body.
    - Checks if the key has credits remaining.
    - If so, decrements the credit count by 1 and returns success.
    - If not, returns an error indicating no credits left.
    """
    data = request.json
    api_key = data.get("key")
    if not api_key:
        return jsonify({"error": "No key provided"}), 400
    try:
        conn = get_db_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT credits FROM api_keys WHERE key = %s FOR UPDATE", (api_key,))
                row = cur.fetchone()
                if not row:
                    return jsonify({"error": "Invalid key"}), 400
                if row["credits"] <= 0:
                    return jsonify({"error": "No credits left"}), 402
                cur.execute("UPDATE api_keys SET credits = credits - 1 WHERE key = %s", (api_key,))
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/api/create-checkout-session", methods=["POST"])
def create_checkout_session():
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=[
                {
                    # "price": "price_1RXtNjHfMuGDLClYU8IlawNh", # production id
                    "price": "price_1Rb7FCHfMuGDLClYhWwvtgAz", # test id
                    "quantity": 1,
                }
            ],
            success_url="https://saturday-topics-landing.onrender.com/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="https://saturday-topics-landing.onrender.com/cancel",
        )
        return jsonify({"url": session.url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
