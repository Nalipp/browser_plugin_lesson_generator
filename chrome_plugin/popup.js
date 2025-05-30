document.addEventListener('DOMContentLoaded', function () {

  const REQUEST_URL = 'http://localhost:5001/api/process-content'; // DEV 
  // const REQUEST_URL = 'https://browser-plugin-lesson-generator.onrender.com/api/process-content'; // PROD 
    
  const scrapeButton = document.getElementById('scrapeButton');
  const statusDiv = document.getElementById('status');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');

  const instructions = [
    'Please stay on this browser tab while we generate your lesson',
    'This may take a minute or two',
    'I hope you are having a nice day',
    'This lesson is going to be awesome',
  ];
  let instructionIndex = 0;
  let instructionInterval = null;
  let progressInterval = null;
  let progress = 0;
  let progressStartTime = null;
  const PROGRESS_MAX = 95;
  const PROGRESS_DURATION = 20000;

  const progressMilestones = [
    { percent: 5, time: 2000 },
    { percent: 12, time: 4000 },
    { percent: 22, time: 7000 },
    { percent: 38, time: 10000 },
    { percent: 55, time: 12000 },
    { percent: 70, time: 16000 },
    { percent: 85, time: 18000 },
    { percent: PROGRESS_MAX, time: PROGRESS_DURATION }
  ];

  const fadeStatus = (text, callback) => {
    statusDiv.style.opacity = 0;
    setTimeout(() => {
      statusDiv.textContent = text;
      statusDiv.style.opacity = 1;
      if (callback) callback();
    }, 600);
  };

  const startRotatingInstructions = () => {
    fadeStatus(instructions[instructionIndex]);
    instructionInterval = setInterval(() => {
      instructionIndex = (instructionIndex + 1) % instructions.length;
      fadeStatus(instructions[instructionIndex]);
    }, 3500);
  };

  const stopRotatingInstructions = () => {
    clearInterval(instructionInterval);
    instructionInterval = null;
  };

  const startProgressBar = () => {
    progressContainer.style.display = 'block';
    progress = 0;
    progressBar.style.width = '0%';
    let milestoneIndex = 0;
    let lastTime = 0;
    progressInterval = setInterval(() => {
      const now = Date.now();
      if (!progressStartTime) progressStartTime = now;
      const elapsed = now - progressStartTime;
      while (
        milestoneIndex < progressMilestones.length - 1 &&
        elapsed > progressMilestones[milestoneIndex + 1].time
      ) {
        milestoneIndex++;
      }
      const current = progressMilestones[milestoneIndex];
      const next = progressMilestones[milestoneIndex + 1];
      if (next) {
        const localElapsed = elapsed - current.time;
        const localDuration = next.time - current.time;
        const localProgress = localElapsed / localDuration;
        progress = current.percent + (next.percent - current.percent) * localProgress;
      } else {
        progress = PROGRESS_MAX;
        clearInterval(progressInterval);
      }
      progressBar.style.width = progress + '%';
    }, 100);
  };

  const finishProgressBar = async () => {
    clearInterval(progressInterval);
    progressBar.style.width = '100%';
    // Wait for the transition to finish (0.3s from CSS, add a little buffer)
    await new Promise((resolve) => setTimeout(resolve, 400));
    progressContainer.style.display = 'none';
    progressBar.style.width = '0%';
    progressStartTime = null;
  };

  const sendToBackend = async (content) => {
    try {
      const response = await fetch(
        REQUEST_URL,
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
      scrapeButton.disabled = true;
      startRotatingInstructions();
      startProgressBar();
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

      const processedContent = await sendToBackend(scrapedContent);

      await chrome.storage.local.set({
        processedContent: processedContent,
        processingTimestamp: new Date().toISOString(),
      });

      stopRotatingInstructions();
      fadeStatus('Content processed successfully!');
      await finishProgressBar();
      chrome.tabs.create({ url: chrome.runtime.getURL('result.html') });
      scrapeButton.disabled = false;
    } catch (error) {
      stopRotatingInstructions();
      await finishProgressBar();
      scrapeButton.disabled = false;
      console.error('Error during scraping:', error);
      fadeStatus('Error: ' + error.message);
    }
  });

  document.getElementById('print-btn').addEventListener('click', () => {
    window.open(chrome.runtime.getURL('print.html'), '_blank');
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
