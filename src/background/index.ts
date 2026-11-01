chrome.runtime.onInstalled.addListener(() => {
  console.log("WhatsApp Assistant v2.0.0 installed.");
});

// Listen for keyboard command (Ctrl+Shift+U / Cmd+Shift+U)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-privacy") {
    try {
      // Query active tab in current window (does not require 'tabs' permission in MV3)
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
            // Tab might not be a WhatsApp tab or content script not ready
          }
        }
      }
    } catch {
      // Ignore
    }
  }
});
