document.addEventListener('DOMContentLoaded', function () {
  const scrapeButton = document.getElementById('scrapeButton');
  const statusDiv = document.getElementById('status');


  const sendToBackend = async (content) => {
    try {
      const response = await fetch(
          // 'http://localhost:5001/api/process-content', // DEV 
          'https://browser-plugin-lesson-generator.onrender.com/api/process-content', // PROD
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(content),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending to backend:', error);
      throw error;
    }
  };

  scrapeButton.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scrapePageContent,
      });

      const scrapedContent = results[0].result;

      await chrome.storage.local.set({
        scrapedContent: scrapedContent,
        timestamp: new Date().toISOString(),
        url: tab.url,
      });

      statusDiv.textContent = 'Processing content...';
      const processedContent = await sendToBackend(scrapedContent);

      await chrome.storage.local.set({
        processedContent: processedContent,
        processingTimestamp: new Date().toISOString(),
      });

      chrome.tabs.create({ url: chrome.runtime.getURL('result.html') });

      statusDiv.textContent = 'Content processed successfully!';
    } catch (error) {
      console.error('Error during scraping:', error);
      statusDiv.textContent = 'Error: ' + error.message;
    }
  });
});

function scrapePageContent() {
  const cleanText = (text) => {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, ' ') // Replace newlines with space
      .trim();
  };

  const extractMainContent = () => {
    const mainContent = document.querySelector(
      'main, article, [role="main"], .main, #main, .content, #content'
    );
    if (mainContent) {
      return mainContent.innerText;
    }
    return document.body.innerText;
  };

  const extractMetadata = () => {
    const metadata = {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      keywords: document.querySelector('meta[name="keywords"]')?.content || '',
      author: document.querySelector('meta[name="author"]')?.content || '',
      publishedDate:
        document.querySelector('meta[property="article:published_time"]')?.content ||
        '',
    };
    return metadata;
  };

  const mainContent = extractMainContent();

  const content = {
    metadata: extractMetadata(),
    mainContent: cleanText(mainContent),
    url: window.location.href,
    timestamp: new Date().toISOString(),
    wordCount: mainContent.split(/\s+/).length,
  };

  return content;
}
