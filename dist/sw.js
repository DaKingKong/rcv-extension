(() => {
  // src/client/sw.js
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "openOauth") {
      const responseUrl = await chrome.identity.launchWebAuthFlow(
        {
          url: request.url,
          interactive: true
        }
      );
      chrome.tabs.sendMessage(
        sender.tab.id,
        {
          action: "returnCallbackUri",
          responseUrl
        }
      );
    }
  });
})();
