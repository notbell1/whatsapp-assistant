import { loadPrivacySettings, savePrivacySettings } from "../storage";
import type { WhatsAppAssistantSettings } from "../storage/types";

let currentSettings: WhatsAppAssistantSettings;

async function notifyTabsSettingsChanged(): Promise<void> {
  const tabs = await chrome.tabs.query({ url: ["https://web.whatsapp.com/*"] });
  for (const tab of tabs) {
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: "WA_ASSISTANT_SETTINGS_CHANGED",
        });
      } catch {
        // Tab might not be loaded
      }
    }
  }
}

async function initPopup(): Promise<void> {
  currentSettings = await loadPrivacySettings();

  const masterToggle = document.getElementById("masterToggle") as HTMLButtonElement;
  const masterCard = document.getElementById("masterCard") as HTMLElement;
  const masterStatus = document.getElementById("masterStatus") as HTMLElement;
  const safeModeToggle = document.getElementById("safeModeToggle") as HTMLButtonElement;
  const btnOpenWA = document.getElementById("btnOpenWA") as HTMLButtonElement;

  function updateView(): void {
    masterToggle.setAttribute("aria-pressed", String(currentSettings.enabled));
    masterCard.setAttribute("data-active", String(currentSettings.enabled));
    masterStatus.textContent = currentSettings.enabled
      ? "Active — Screen Protected"
      : "Disabled";

    safeModeToggle.setAttribute(
      "aria-pressed",
      String(currentSettings.safeScreenShare),
    );
  }

  updateView();

  masterToggle.addEventListener("click", async () => {
    currentSettings.enabled = !currentSettings.enabled;
    updateView();
    await savePrivacySettings(currentSettings);
    await notifyTabsSettingsChanged();
  });

  safeModeToggle.addEventListener("click", async () => {
    currentSettings.safeScreenShare = !currentSettings.safeScreenShare;
    updateView();
    await savePrivacySettings(currentSettings);
    await notifyTabsSettingsChanged();
  });

  btnOpenWA.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({ url: ["https://web.whatsapp.com/*"] });
    if (tabs.length > 0 && tabs[0].id) {
      await chrome.tabs.update(tabs[0].id, { active: true });
      if (tabs[0].windowId) {
        await chrome.windows.update(tabs[0].windowId, { focused: true });
      }
    } else {
      await chrome.tabs.create({ url: "https://web.whatsapp.com/" });
    }
    window.close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  void initPopup();
});

