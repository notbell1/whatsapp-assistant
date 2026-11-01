import { openWhatsAppView } from "./whatsapp-view";

const WHATSAPP_ITEM_ATTRIBUTE = "data-whatsapp";
const WHATSAPP_WRAPPER_VALUE = "wrapper";
const WHATSAPP_CONTAINER_VALUE = "container";
const WHATSAPP_BUTTON_VALUE = "navbar-item";
const WHATSAPP_ICON_VALUE = "icon";

export function createWhatsAppItem(): HTMLDivElement {
  const wrapperDiv = document.createElement("div");
  wrapperDiv.setAttribute(WHATSAPP_ITEM_ATTRIBUTE, WHATSAPP_WRAPPER_VALUE);

  const buttonContainer = document.createElement("div");
  buttonContainer.setAttribute(WHATSAPP_ITEM_ATTRIBUTE, WHATSAPP_CONTAINER_VALUE);

  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "WhatsApp Assistant");
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("data-navbar-item", "true");
  button.setAttribute(WHATSAPP_ITEM_ATTRIBUTE, WHATSAPP_BUTTON_VALUE);
  button.setAttribute("tabindex", "-1");
  // Do NOT set native 'title' attribute to prevent the ugly OS default black-box tooltip

  const icon = document.createElement("span");
  icon.setAttribute(WHATSAPP_ITEM_ATTRIBUTE, WHATSAPP_ICON_VALUE);
  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <defs>
        <linearGradient id="waAssistantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00FFA3" />
          <stop offset="45%" stop-color="#25D366" />
          <stop offset="100%" stop-color="#00D2FF" />
        </linearGradient>
      </defs>
      <path d="M12 1.5L21.5 4.8V11.8C21.5 17.5 17.2 22 12 23.2C6.8 22 2.5 17.5 2.5 11.8V4.8L12 1.5Z" fill="url(#waAssistantGrad)" stroke="#ffffff" stroke-width="0.8" stroke-linejoin="round"/>
      <path d="M12 5.5C8.4 5.5 5.5 8.4 5.5 12C5.5 13.2 5.85 14.3 6.45 15.25L5.5 18.5L8.75 17.75C9.7 18.4 10.8 18.5 12 18.5C15.6 18.5 18.5 15.6 18.5 12C18.5 8.4 15.6 5.5 12 5.5Z" fill="#111b21"/>
      <path d="M14.2 13.5c-.15-.08-.9-.45-1.04-.5-.14-.05-.24-.08-.34.08-.1.15-.39.5-.48.6-.09.1-.18.12-.33.04-.15-.08-.64-.24-1.22-.76-.45-.4-.76-.9-.85-1.05-.09-.15-.01-.23.07-.31.07-.07.15-.18.23-.27.08-.09.1-.15.15-.25.05-.1.03-.19-.01-.27-.04-.08-.34-.83-.47-1.13-.12-.3-.25-.26-.34-.26-.09 0-.19 0-.29 0-.1 0-.27.04-.41.19-.14.15-.53.52-.53 1.27 0 .75.55 1.48.62 1.58.08.1 1.07 1.64 2.6 2.3.36.16.65.25.87.32.36.12.7.1 .96.06.3-.04.9-.37 1.03-.73.13-.36.13-.66.09-.73-.04-.06-.14-.1-.29-.18z" fill="#FFFFFF"/>
    </svg>
  `;

  button.appendChild(icon);
  buttonContainer.appendChild(button);
  wrapperDiv.appendChild(buttonContainer);

  // Native WhatsApp-style custom tooltip
  button.addEventListener("pointerenter", () => showNavbarTooltip(button));
  button.addEventListener("pointerleave", hideNavbarTooltip);
  button.addEventListener("click", () => {
    hideNavbarTooltip();
    handleWhatsAppClick();
  });

  return wrapperDiv;
}

let activeTooltip: HTMLDivElement | null = null;

function showNavbarTooltip(target: HTMLElement): void {
  hideNavbarTooltip();

  const tooltip = document.createElement("div");
  tooltip.id = "whatsapp-navbar-tooltip";
  tooltip.className = "whatsapp-navbar-tooltip";
  tooltip.textContent = "WhatsApp Assistant";

  document.body.appendChild(tooltip);
  activeTooltip = tooltip;

  const rect = target.getBoundingClientRect();
  const left = rect.right + 10;
  const top = rect.top + rect.height / 2;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;

  requestAnimationFrame(() => {
    tooltip.classList.add("show");
  });
}

export function hideNavbarTooltip(): void {
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}

function handleWhatsAppClick(): void {
  hideNavbarTooltip();
  openWhatsAppView();
}

export function getWhatsAppButton(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(
    'button[data-navbar-item="true"][data-whatsapp="navbar-item"]',
  );
}

export function isWhatsAppButtonConnected(): boolean {
  const button = getWhatsAppButton();
  return Boolean(button && button.isConnected);
}

export function setWhatsAppButtonActive(active: boolean): void {
  const button = getWhatsAppButton();
  if (!button) {
    return;
  }
  button.setAttribute("aria-pressed", String(active));
  hideNavbarTooltip();
}

