export const WHATSAPP_BLUR_CLASS = "whatsapp-privacy-blur";
export const WHATSAPP_BLUR_ATTRIBUTE = "data-whatsapp-blurred";

const BLUR_MIN = 0;
const BLUR_MAX = 20;

export function clampIntensity(intensity: number): number {
  if (!Number.isFinite(intensity)) {
    return 6;
  }
  return Math.max(BLUR_MIN, Math.min(BLUR_MAX, intensity));
}

export function applyBlur(element: HTMLElement): void {
  if (element.closest('[data-whatsapp="view"]')) {
    return;
  }

  if (
    element.classList.contains("whatsapp-emoji-sensor") ||
    element.classList.contains("whatsapp-reaction-sensor")
  ) {
    return;
  }

  element.classList.add(WHATSAPP_BLUR_CLASS);
  element.setAttribute(WHATSAPP_BLUR_ATTRIBUTE, "true");
}

export function removeBlur(element: HTMLElement): void {
  element.classList.remove(WHATSAPP_BLUR_CLASS);
  element.removeAttribute(WHATSAPP_BLUR_ATTRIBUTE);
}
