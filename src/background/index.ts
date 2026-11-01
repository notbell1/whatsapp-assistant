chrome.runtime.onInstalled.addListener(() => {
  console.log("WhatsApp Assistant v2.1.0 installed.");
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-privacy") {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      for (const tab of tabs) {
        if (tab.id) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: "WA_ASSISTANT_TOGGLE_PRIVACY",
            });
          } catch {
            // Ignore if content script is not yet active
          }
        }
      }
    } catch {
      // Ignore
    }
  }
});
