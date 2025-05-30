# English Lesson Plan Generator Chrome Extension

A Chrome extension that helps generate English lesson plans by scraping web content.

---

## How It Works
1. User clicks the extension popup and scrapes the current page
2. Extension sends the scraped content to the backend (Render or local Flask)
3. Backend generates a lesson plan using OpenAI and returns it
4. Extension opens a new tab and displays the formatted lesson plan



## Installation

1. Clone this repository or download the files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the directory containing these files

## Usage

1. Click the extension icon in your Chrome toolbar
2. Navigate to any webpage you want to use as source material
3. Right click on popup for inspector tools
4. Click the "Scrape Current Page" button
5. The content will be saved locally in your browser

## Development

IMPORTANT
PROD and dEV mode are not automatic at this point
Comment out the PROD url and uncomment DEV from popup.js
The extension uses Chrome's Storage API to store scraped content locally. This data can be accessed later for generating lesson plans.

## Files

- `manifest.json`: Extension configuration
- `popup.html`: Extension popup interface
- `popup.js`: Extension functionality
- `icons/`: Directory containing extension icons

## Next Steps

- Implement AI integration for lesson plan generation
- Add content filtering options
- Create a lesson plan viewer interface

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
  The backend will be available at `http://localhost:5001` by default.

### 3. Chrome Extension Setup
- Go to `chrome://extensions/` in Chrome
- Enable Developer Mode
- Click "Load unpacked" and select the `chrome_plugin` directory
- Use the extension popup to scrape and generate lesson plans


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

## Deployment
- Backend can be deployed to [Render](https://render.com/) as a web service
- Set your `OPENAI_API_KEY` as an environment variable in Render
- Update the extension's backend URL to your Render endpoint
