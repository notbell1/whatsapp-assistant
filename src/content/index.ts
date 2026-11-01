import { startWhatsAppObserver } from "./whatsapp/observer";
import { startPrivacyEngine } from "./privacy/engine";
import { initWhatsAppGlobalShortcuts } from "./ui/whatsapp-view";

function initialize(): void {
  startWhatsAppObserver();
  void startPrivacyEngine();
  initWhatsAppGlobalShortcuts();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true });
} else {
  initialize();
}
