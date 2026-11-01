import type { WhatsAppAssistantSettings } from "./types";

export const STORAGE_KEY = "whatsappAssistantSettings";
export const LEGACY_STORAGE_KEY = "whatsappPrivacySettings";

export const DEFAULT_SETTINGS: WhatsAppAssistantSettings = {
  enabled: true,
  messages: false,
  contactNames: false,
  profilePictures: false,
  media: false,
  files: false,
  chatPreview: false,
  composeBox: false,
  safeScreenShare: false,
  blurIntensity: 6,
};

function isExtensionValid(): boolean {
  try {
    return Boolean(typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id);
  } catch {
    return false;
  }
}

export async function loadPrivacySettings(): Promise<WhatsAppAssistantSettings> {
  if (!isExtensionValid()) {
    return DEFAULT_SETTINGS;
  }

  try {
    const result = await chrome.storage.local.get([STORAGE_KEY, LEGACY_STORAGE_KEY]);
    const stored = (result[STORAGE_KEY] ?? result[LEGACY_STORAGE_KEY]) as
      | Partial<WhatsAppAssistantSettings>
      | undefined;

    return {
      ...DEFAULT_SETTINGS,
      ...(stored ?? {}),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function savePrivacySettings(
  settings: WhatsAppAssistantSettings,
): Promise<void> {
  if (!isExtensionValid()) {
    return;
  }

  try {
    await chrome.storage.local.set({
      [STORAGE_KEY]: settings,
    });
  } catch {
    // Ignore error if extension context was invalidated
  }
}
