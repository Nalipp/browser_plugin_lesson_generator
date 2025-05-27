document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup DOM loaded');
  const scrapeButton = document.getElementById('scrapeButton');
  const statusDiv = document.getElementById('status');

  // Function to send content to backend
  const sendToBackend = async (content) => {
    try {
      const response = await fetch('https://browser-plugin-lesson-generator.onrender.com/api/process-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content)
      });
      
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
    console.log('Scrape button clicked');
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Active tab:', tab);
      
      // Execute content script to scrape the page
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scrapePageContent
      });
      console.log('Scraping results:', results);

      // Get the scraped content
      const scrapedContent = results[0].result;
      console.log('Scraped content:', scrapedContent);

      // Store the content in Chrome storage
      await chrome.storage.local.set({
        'scrapedContent': scrapedContent,
        'timestamp': new Date().toISOString(),
        'url': tab.url
      });
      console.log('Content stored in Chrome storage');

      // Send to backend for processing
      statusDiv.textContent = 'Processing content...';
      const processedContent = await sendToBackend(scrapedContent);
      console.log('Processed content:', processedContent);

      // Store the processed content
      await chrome.storage.local.set({
        'processedContent': processedContent,
        'processingTimestamp': new Date().toISOString()
      });

      statusDiv.textContent = 'Content processed successfully!';
    } catch (error) {
      console.error('Error during scraping:', error);
      statusDiv.textContent = 'Error: ' + error.message;
    }
  });
});

// This function will be injected into the page
function scrapePageContent() {
  console.log('Scraping page content');
  
  // Helper function to clean text
  const cleanText = (text) => {
    return text
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n+/g, ' ')  // Replace newlines with space
      .trim();
  };

  // Helper function to extract main content
  const extractMainContent = () => {
    // Try to find the main content area
    const mainContent = document.querySelector('main, article, [role="main"], .main, #main, .content, #content');
    if (mainContent) {
      return mainContent.innerText;
    }
    return document.body.innerText;
  };

  // Helper function to extract metadata
  const extractMetadata = () => {
    const metadata = {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      keywords: document.querySelector('meta[name="keywords"]')?.content || '',
      author: document.querySelector('meta[name="author"]')?.content || '',
      publishedDate: document.querySelector('meta[property="article:published_time"]')?.content || '',
    };
    return metadata;
  };

  // Get the main content
  const mainContent = extractMainContent();
  
  // Structure the content
  const content = {
    metadata: extractMetadata(),
    mainContent: cleanText(mainContent),
    url: window.location.href,
    timestamp: new Date().toISOString(),
    wordCount: mainContent.split(/\s+/).length,
    // You could add more structured data here
    // paragraphs: Array.from(document.querySelectorAll('p')).map(p => cleanText(p.innerText)),
    // headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
    //   level: h.tagName.toLowerCase(),
    //   text: cleanText(h.innerText)
    // })),
  };

  console.log('Scraped content:', content);
  return content;
} 
