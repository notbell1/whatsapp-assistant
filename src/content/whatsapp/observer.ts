import { injectWhatsAppButton } from "./navigation";
import { isWhatsAppButtonConnected } from "../ui/whatsapp-button";

let observer: MutationObserver | null = null;
let debounceTimer: number | null = null;

export function startWhatsAppObserver(): void {
  if (observer) {
    return;
  }

  observer = new MutationObserver(() => {
    // Ultra-fast check: if button is already in DOM, do zero work
    if (isWhatsAppButtonConnected()) {
      return;
    }

    if (debounceTimer !== null) {
      return;
    }

    debounceTimer = window.setTimeout(() => {
      debounceTimer = null;
      if (!isWhatsAppButtonConnected()) {
        injectWhatsAppButton();
      }
    }, 250);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  injectWhatsAppButton();
}
