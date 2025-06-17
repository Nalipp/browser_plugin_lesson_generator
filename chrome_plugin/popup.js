document.addEventListener('DOMContentLoaded', function () {
  const REQUEST_URL = 'https://browser-plugin-lesson-generator.onrender.com/api/';

  const scrapeButton = document.getElementById('scrapeButton');
  const statusDiv = document.getElementById('status');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const buyButton = document.getElementById("buy-button");
  const apiKeyInput = document.getElementById('apiKeyInput');
  const submitApiKey = document.getElementById('submitApiKey');
  const freeLessonsBtn = document.getElementById('freeLessonsBtn');
  const freeLessonsDropdown = document.getElementById('freeLessonsDropdown');
  const creditInfo = document.getElementById('creditInfo');
  const apiKeyContainer = document.getElementById('apiKeyContainer');
  const tooltip = document.getElementById('tooltip');
  const tooltipPopup = document.getElementById('tooltip-popup');

  chrome.storage.local.get('apiKey', ({ apiKey }) => {
    if (apiKey && apiKeyInput) apiKeyInput.value = apiKey;
  });

  apiKeyInput.addEventListener('input', () => {
    chrome.storage.local.set({ apiKey: apiKeyInput.value });
  });

  submitApiKey.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      chrome.storage.local.set({ apiKey: key });
      fadeStatus('User code saved.');
    } else {
      fadeStatus('Please enter a valid user code.');
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url.includes('success')) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => localStorage.getItem('apiKey'),
      }, (results) => {
        const key = results?.[0]?.result;
        if (key) chrome.storage.local.set({ apiKey: key });
      });
    }
  });

  // Rotating instructions
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
  };

  const startProgressBar = () => {
    progressContainer.style.display = 'block';
    progress = 0;
    progressBar.style.width = '0%';
    let milestoneIndex = 0;
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
    await new Promise((resolve) => setTimeout(resolve, 400));
    progressContainer.style.display = 'none';
    progressBar.style.width = '0%';
    progressStartTime = null;
  };

  const sendToBackend = async (content) => {
    const response = await fetch(REQUEST_URL + 'process-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
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
        scrapedContent,
        timestamp: new Date().toISOString(),
        url: tab.url,
      });

      const processedContent = await sendToBackend(scrapedContent);

      await chrome.storage.local.set({
        processedContent,
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

  buyButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "startCheckout" });
  });

  freeLessonsBtn.addEventListener('click', () => {
    const isVisible = freeLessonsDropdown.style.display === 'block';
    freeLessonsDropdown.style.display = isVisible ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    if (!freeLessonsBtn.contains(e.target) && !freeLessonsDropdown.contains(e.target)) {
      freeLessonsDropdown.style.display = 'none';
    }
  });

  chrome.storage.local.get('credits', ({ credits }) => {
    const count = credits ?? 0;
    // const count = credits ?? 5;
    creditInfo.textContent = `${count} credits`;
    if (count <= 0) {
      buyButton.style.display = 'block';
      scrapeButton.style.display = 'none';
      apiKeyContainer.style.display = 'flex';
    } else {
      buyButton.style.display = 'none';
      scrapeButton.style.display = 'block';
      apiKeyContainer.style.display = 'none';
    }
  });

  if (tooltip && tooltipPopup) {
    tooltip.addEventListener('focus', () => {
      tooltipPopup.style.display = 'block';
    });
    tooltip.addEventListener('blur', () => {
      tooltipPopup.style.display = 'none';
    });
    tooltip.addEventListener('mouseenter', () => {
      tooltipPopup.style.display = 'block';
    });
    tooltip.addEventListener('mouseleave', () => {
      tooltipPopup.style.display = 'none';
    });
  }
});

function scrapePageContent() {
  const cleanText = (text) => text.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim();

  const extractMainContent = () => {
    const mainContent = document.querySelector(
      'main, article, [role="main"], .main, #main, .content, #content'
    );
    return mainContent?.innerText || document.body.innerText;
  };

  const extractMetadata = () => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || '',
    keywords: document.querySelector('meta[name="keywords"]')?.content || '',
    author: document.querySelector('meta[name="author"]')?.content || '',
    publishedDate: document.querySelector('meta[property="article:published_time"]')?.content || '',
  });

  const mainContent = extractMainContent();
  return {
    metadata: extractMetadata(),
    mainContent: cleanText(mainContent),
    url: window.location.href,
    timestamp: new Date().toISOString(),
    wordCount: mainContent.split(/\s+/).length,
  };
}
