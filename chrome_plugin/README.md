# English Lesson Plan Generator Chrome Extension

A Chrome extension that helps generate English lesson plans by scraping web content.

## Installation

1. Clone this repository or download the files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the directory containing these files

## Usage

1. Click the extension icon in your Chrome toolbar
2. Navigate to any webpage you want to use as source material
3. Click the "Scrape Current Page" button
4. The content will be saved locally in your browser

## Development

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