chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startCheckout") {
    // fetch("http://localhost:5001/api/create-checkout-session", { method: "POST" })
    fetch("https://browser-plugin-lesson-generator.onrender.com/api/create-checkout-session", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          chrome.tabs.create({ url: data.url });
        } else {
          console.error("Error: ", data.error);
        }
      })
      .catch(err => console.error("Error: ", err));
  }
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.action === "storeApiKey" && message.key) {
    chrome.storage.local.set({ apiKey: message.key }, () => {
      console.log("API key stored");
      sendResponse({ status: "success" });
    });
    return true;
  }
});
