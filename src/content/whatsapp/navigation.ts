import { WHATSAPP_SELECTORS } from "./selectors";
import { createWhatsAppItem, getWhatsAppButton } from "../ui/whatsapp-button";

let isInjecting = false;

export function injectWhatsAppButton(): void {
  if (isInjecting) {
    return;
  }

  isInjecting = true;

  try {
    const existingButton = getWhatsAppButton();

    if (existingButton && existingButton.isConnected) {
      return;
    }

    const whatsappItem = createWhatsAppItem();
    const metaAIButton = document.querySelector<HTMLButtonElement>(
      WHATSAPP_SELECTORS.metaAI,
    );
    if (metaAIButton) {
      const metaAIDivInner = metaAIButton.parentElement;
      if (!metaAIDivInner) return;

      const metaAISpan = metaAIDivInner.parentElement;
      if (!metaAISpan) return;

      const metaAIDivOuter = metaAISpan.parentElement;
      if (!metaAIDivOuter) return;

      const navbarContainer = metaAIDivOuter.parentElement;
      if (!navbarContainer) return;
      if (
        navbarContainer.querySelector(
          'button[data-whatsapp="navbar-item"]',
        )
      ) {
        return;
      }
      navbarContainer.insertBefore(whatsappItem, metaAIDivOuter.nextSibling);
    } else {
      const primaryNavbarContainer = document.querySelector<HTMLDivElement>(
        '[data-testid="navbar-primary-section"] > div > div',
      );

      if (primaryNavbarContainer) {
        if (
          primaryNavbarContainer.querySelector(
            'button[data-whatsapp="navbar-item"]',
          )
        ) {
          return;
        }
        primaryNavbarContainer.appendChild(whatsappItem);
      }
    }
  } finally {
    isInjecting = false;
  }
}
