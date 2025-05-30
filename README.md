# Browser Plugin Lesson Generator

This project is a Chrome extension that scrapes content from any website, sends it to a serverless backend (hosted on Render), and generates an AI-powered lesson plan using OpenAI. The lesson plan is then displayed in a new tab for easy viewing, copying, or downloading.

## Features
- Chrome extension popup to scrape the current page
- Sends scraped content to a secure backend (hides OpenAI API key)
- Backend processes content and generates a lesson plan using OpenAI
- Lesson plan is displayed in a new tab with user-friendly formatting
- Modern linting and formatting for both Python and JavaScript code

---

## Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Nalipp/browser_plugin_lesson_generator.git
cd browser_plugin_lesson_generator
```

### 2. Python Backend Setup
- Create and activate a virtual environment:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Add your OpenAI API key to a `.env` file:
  ```env
  OPENAI_API_KEY=your_openai_api_key_here
  ```
- Run the backend locally:
  ```bash
  python app.py
  ```
  The backend will be available at `http://localhost:10000` by default.

### 3. Chrome Extension Setup
- Go to `chrome://extensions/` in Chrome
- Enable Developer Mode
- Click "Load unpacked" and select the `chrome_plugin` directory
- Use the extension popup to scrape and generate lesson plans

### 4. JavaScript Dev Tools (in `chrome_plugin` directory)
- Install Node.js dependencies:
  ```bash
  cd chrome_plugin
  npm install
  ```
- Format code:
  ```bash
  npm run format
  ```
- Lint code:
  ```bash
  npm run lint
  ```

### 5. Python Linting & Formatting (from project root)
- Format code:
  ```bash
  black .
  isort .
  ```
- Lint code:
  ```bash
  flake8
  ```

---

## Running Linters & Formatters

### Python (from project root)
- **Format code with Black:**
  ```bash
  black .
  ```
- **Sort imports with isort:**
  ```bash
  isort .
  ```
- **Lint code with Flake8:**
  ```bash
  flake8
  ```

### JavaScript (from `chrome_plugin` directory)
- **Format code with Prettier:**
  ```bash
  npm run format
  ```
- **Lint code with ESLint:**
  ```bash
  npm run lint
  ```

---

## Project Structure

- `chrome_plugin/` — Chrome extension source code (popup, content scripts, result display)
- `app.py` — Flask backend for processing and generating lesson plans
- `lesson_generator_prompts/` — Prompt templates and helpers for lesson generation
- `requirements.txt` — Python dependencies (including dev tools)
- `.flake8`, `pyproject.toml` — Python lint/format config
- `.eslintrc.json`, `.prettierrc`, `package.json` — JS lint/format config (in `chrome_plugin/`)

---

## How It Works
1. User clicks the extension popup and scrapes the current page
2. Extension sends the scraped content to the backend (Render or local Flask)
3. Backend generates a lesson plan using OpenAI and returns it
4. Extension opens a new tab and displays the formatted lesson plan

---

## Deployment
- Backend can be deployed to [Render](https://render.com/) as a web service
- Set your `OPENAI_API_KEY` as an environment variable in Render
- Update the extension's backend URL to your Render endpoint

---

## Contributing
Pull requests and issues are welcome!

---

## License
MIT 