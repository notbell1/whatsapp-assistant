import {
  applyBlur,
  removeBlur,
  clampIntensity,
  WHATSAPP_BLUR_CLASS,
} from "./blur";

import { PRIVACY_SELECTORS } from "./selectors";
import { loadPrivacySettings, savePrivacySettings } from "../../storage";
import type { WhatsAppAssistantSettings } from "../../storage/types";

export type PrivacyEngineSettings = WhatsAppAssistantSettings;

const MESSAGE_META_SELECTORS = [
  '[data-testid="msg-meta"]',
  '[data-testid*="msg-meta" i]',
];

const STATUS_TITLE_KEYWORDS = [
  "wds-ic-delivered",
  "wds-ic-read",
  "wds-ic-sent",
  "wds-ic-check",
  "wds-ic-double-check",
  "wds-ic-played",
];

const IGNORE_SELECTORS = [
  '[data-whatsapp="view"]',
  '[data-whatsapp="item"]',
  '[data-whatsapp="container"]',
  '[data-whatsapp="navbar-item"]',
  '[data-whatsapp="icon"]',
  "#whatsapp-assistant-toast",
];

const CONTACT_NAME_SELECTORS = [
  '[data-testid="conversation-info-header-chat-title"]',
  '[data-testid="author"]',
  '[data-testid="cell-frame-title"] span[dir="auto"][title]',
];

const CHAT_PREVIEW_SELECTORS = ['[data-testid="cell-frame-secondary"]'];

const SIDEBAR_AVATAR_SELECTORS = [...PRIVACY_SELECTORS.profilePictures];

const MESSAGE_TEXT_SELECTORS = [
  '[data-testid^="conv-msg-"] [data-testid="selectable-text"]',
  '[data-testid^="conv-msg-"] [data-testid="message-text"]',
  '[data-testid^="conv-msg-"] span.selectable-text',
  '[data-testid="selectable-text"]',
  '[data-testid="message-text"]',
  "span.selectable-text",
];

const LINK_PREVIEW_SELECTORS = [
  '[data-testid="link-preview"]',
  '[data-testid="link-preview-container"]',
  '[data-testid="group-invite-link"]',
  '[data-testid="group-invite"]',
  '[data-testid="invite-link"]',
  '[data-testid="url-preview"]',
  '[data-testid="suspicious-link-container"]',
  '[data-testid^="conv-msg-"] a',
  'div.message-in a',
  'div.message-out a',
  'div[data-id] a',
  'div.message-in [tabindex="-1"]',
  'div.message-out [tabindex="-1"]',
  '[data-testid^="conv-msg-"] [tabindex="-1"]',
];

const COMPOSE_BOX_SELECTORS = [...PRIVACY_SELECTORS.composeBox];
const PROFILE_PICTURE_SELECTORS = [...PRIVACY_SELECTORS.profilePictures];
const MEDIA_SELECTORS = [...PRIVACY_SELECTORS.media];
const FILE_SELECTORS = [...PRIVACY_SELECTORS.files];

/* =========================================================
 * ENGINE STATE
 * ========================================================= */

let privacySettings: WhatsAppAssistantSettings | null = null;
let observer: MutationObserver | null = null;
let scanFrame: number | null = null;
let isScanning = false;
let hasPendingScan = false;
let engineStarted = false;

/* =========================================================
 * PUBLIC API
 * ========================================================= */

export async function startPrivacyEngine(
  initialSettings?: PrivacyEngineSettings,
): Promise<void> {
  if (engineStarted) {
    if (initialSettings) {
      applySettingsDirectly(initialSettings);
    }
    return;
  }

  engineStarted = true;

  if (initialSettings) {
    privacySettings = { ...initialSettings };
  } else {
    privacySettings = await loadPrivacySettings();
  }

  syncRootStyles();
  startObserver();
  processPrivacy();
}

export function applySettingsDirectly(settings: PrivacyEngineSettings): void {
  privacySettings = { ...settings };
  syncRootStyles();
  void savePrivacySettings(privacySettings);
  processPrivacy(); // Synchronous immediate DOM scan for 100% real-time response
}

export async function updatePrivacySettings(
  settings: PrivacyEngineSettings,
): Promise<void> {
  applySettingsDirectly(settings);
}

export function getPrivacySettings(): PrivacyEngineSettings | null {
  if (!privacySettings) {
    return null;
  }
  return { ...privacySettings };
}

export function stopPrivacyEngine(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (scanFrame !== null) {
    window.cancelAnimationFrame(scanFrame);
    scanFrame = null;
  }

  cleanupAllBlur();
  resetRootStyles();

  privacySettings = null;
  engineStarted = false;
}

export function scanPrivacyTargets(): void {
  scheduleScan();
}

export function updateBlurIntensity(intensity: number): void {
  if (!privacySettings) {
    return;
  }

  privacySettings = {
    ...privacySettings,
    blurIntensity: intensity,
  };

  syncRootStyles();
  scheduleScan();
}

/* =========================================================
 * ROOT STYLES (Performance & Screen-Sharing mode)
 * ========================================================= */

function syncRootStyles(): void {
  if (!privacySettings) return;

  const intensity = clampIntensity(privacySettings.blurIntensity);
  document.documentElement.style.setProperty("--whatsapp-blur", `${intensity}px`);

  const active = Boolean(privacySettings.enabled);
  document.documentElement.setAttribute("data-wa-active", String(active));
  document.documentElement.setAttribute("data-wa-messages", String(active && privacySettings.messages));
  document.documentElement.setAttribute("data-wa-contacts", String(active && privacySettings.contactNames));
  document.documentElement.setAttribute("data-wa-avatars", String(active && privacySettings.profilePictures));
  document.documentElement.setAttribute("data-wa-media", String(active && privacySettings.media));
  document.documentElement.setAttribute("data-wa-files", String(active && privacySettings.files));
  document.documentElement.setAttribute("data-wa-previews", String(active && privacySettings.chatPreview));
  document.documentElement.setAttribute("data-wa-typing", String(active && privacySettings.composeBox));

  // Safe Screen-Sharing Mode lock
  if (active && privacySettings.safeScreenShare) {
    document.documentElement.setAttribute("data-whatsapp-safe-screen-share", "true");
  } else {
    document.documentElement.removeAttribute("data-whatsapp-safe-screen-share");
  }
}

function resetRootStyles(): void {
  document.documentElement.style.removeProperty("--whatsapp-blur");
  document.documentElement.removeAttribute("data-whatsapp-safe-screen-share");
  document.documentElement.removeAttribute("data-wa-active");
  document.documentElement.removeAttribute("data-wa-messages");
  document.documentElement.removeAttribute("data-wa-contacts");
  document.documentElement.removeAttribute("data-wa-avatars");
  document.documentElement.removeAttribute("data-wa-media");
  document.documentElement.removeAttribute("data-wa-files");
  document.documentElement.removeAttribute("data-wa-previews");
  document.documentElement.removeAttribute("data-wa-typing");
}

/* =========================================================
 * OBSERVER (High-performance mutation filter)
 * ========================================================= */

function startObserver(): void {
  if (observer) {
    return;
  }

  observer = new MutationObserver((mutations) => {
    let hasRelevantMutation = false;
    for (let i = 0; i < mutations.length; i++) {
      const target = mutations[i].target as Node;
      if (target instanceof Element && shouldIgnoreElement(target)) {
        continue;
      }
      hasRelevantMutation = true;
      break;
    }

    if (hasRelevantMutation) {
      scheduleScan();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  });
}

/* =========================================================
 * SCAN SCHEDULER (Debounced for 60FPS Smoothness)
 * ========================================================= */

let scanTimer: number | null = null;

function scheduleScan(): void {
  if (scanTimer !== null) {
    return;
  }

  scanTimer = window.setTimeout(() => {
    scanTimer = null;
    if (scanFrame !== null) {
      window.cancelAnimationFrame(scanFrame);
    }
    scanFrame = window.requestAnimationFrame(() => {
      scanFrame = null;
      processPrivacy();
    });
  }, 80);
}

/* =========================================================
 * MAIN PROCESSOR
 * ========================================================= */

function processPrivacy(): void {
  if (!privacySettings) {
    return;
  }

  if (isScanning) {
    hasPendingScan = true;
    return;
  }

  isScanning = true;
  hasPendingScan = false;

  try {
    if (!privacySettings.enabled) {
      cleanupAllBlur();
      return;
    }

    if (privacySettings.messages) {
      processMessages();
    } else {
      cleanupCategory(getMessageElements());
    }

    if (privacySettings.contactNames) {
      processContactNames();
    } else {
      cleanupCategory(getContactNameElements());
    }

    if (privacySettings.profilePictures) {
      processProfilePictures();
    } else {
      cleanupCategory(getProfilePictureElements());
      cleanupSidebarAvatars();
    }

    if (privacySettings.media) {
      processMedia();
    } else {
      cleanupCategory(getMediaElements());
    }

    if (privacySettings.files) {
      processFiles();
    } else {
      cleanupCategory(getFileElements());
    }

    if (privacySettings.chatPreview) {
      processChatPreviews();
    } else {
      cleanupCategory(getChatPreviewElements());
    }

    if (privacySettings.composeBox) {
      processComposeBox();
    } else {
      cleanupCategory(getComposeBoxElements());
    }

    cleanupProtectedMetadata();
  } finally {
    isScanning = false;
    if (hasPendingScan) {
      hasPendingScan = false;
      scheduleScan();
    }
  }
}

/* =========================================================
 * CONTACT / GROUP NAMES
 * ========================================================= */

function processContactNames(): void {
  const elements = getContactNameElements();

  elements.forEach((element) => {
    if (shouldIgnoreElement(element) || hasContactNameAncestor(element)) {
      return;
    }

    if (!hasVisibleTextOrContent(element)) {
      return;
    }

    applyBlur(element);
  });
}

function getContactNameElements(): HTMLElement[] {
  const elements: HTMLElement[] = [];
  CONTACT_NAME_SELECTORS.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      elements.push(element);
    });
  });
  return uniqueElements(elements);
}

function hasContactNameAncestor(element: HTMLElement): boolean {
  let parent = element.parentElement;
  while (parent) {
    if (isContactNameElement(parent)) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

function isContactNameElement(element: HTMLElement): boolean {
  return (
    element.matches('[data-testid="conversation-info-header-chat-title"]') ||
    element.matches('[data-testid="author"]') ||
    element.matches('[data-testid="cell-frame-title"] span[dir="auto"][title]')
  );
}

/* =========================================================
 * MESSAGES
 * ========================================================= */

function processMessages(): void {
  const elements = getMessageElements();

  elements.forEach((element) => {
    if (
      shouldIgnoreElement(element) ||
      isInsideMessageMeta(element) ||
      isMessageStatusElement(element) ||
      isLikelyMessageTime(element) ||
      !isActualMessageText(element)
    ) {
      return;
    }

    applyBlur(element);
  });
}

function getMessageElements(): HTMLElement[] {
  const elements: HTMLElement[] = [];
  const selectors = [...MESSAGE_TEXT_SELECTORS, ...LINK_PREVIEW_SELECTORS];
  selectors.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      elements.push(element);
    });
  });
  return uniqueElements(elements);
}

function isLinkPreviewCard(element: HTMLElement): boolean {
  if (
    element.matches('[data-testid="link-preview"]') ||
    element.matches('[data-testid="link-preview-container"]') ||
    element.matches('[data-testid="group-invite-link"]') ||
    element.matches('[data-testid="group-invite"]') ||
    element.matches('[data-testid="invite-link"]') ||
    element.matches('[data-testid="url-preview"]') ||
    element.matches('[data-testid="suspicious-link-container"]') ||
    element.matches('a[href]') ||
    element.matches('[role="link"]')
  ) {
    return true;
  }
  if (element.matches('[tabindex="-1"]') && element.querySelector('a, img, svg')) {
    return true;
  }
  return false;
}

function isActualMessageText(element: HTMLElement): boolean {
  return (
    element.matches('[data-testid="selectable-text"]') ||
    element.matches('[data-testid="message-text"]') ||
    element.matches("span.selectable-text") ||
    isLinkPreviewCard(element)
  );
}

function isLikelyMessageTime(element: HTMLElement): boolean {
  if (isInsideMessageMeta(element)) {
    return true;
  }

  if (
    element.matches('[data-testid="selectable-text"]') ||
    element.matches('[data-testid="message-text"]')
  ) {
    return false;
  }

  const text = element.textContent?.trim() ?? "";
  return /^\d{1,2}[.:]\d{2}$/.test(text);
}

/* =========================================================
 * CHAT PREVIEWS
 * ========================================================= */

function processChatPreviews(): void {
  const containers = getChatPreviewElements();

  containers.forEach((container) => {
    if (shouldIgnoreElement(container)) {
      return;
    }

    const statusRoots = Array.from(
      container.querySelectorAll<HTMLElement>('[data-testid="last-msg-status"]'),
    );

    if (statusRoots.length === 0) {
      processFallbackPreviewText(container);
      return;
    }

    statusRoots.forEach((statusRoot) => {
      processPreviewStatusRoot(statusRoot);
    });
  });
}

function processPreviewStatusRoot(statusRoot: HTMLElement): void {
  protectStatusInside(statusRoot);

  const candidates: HTMLElement[] = [];
  statusRoot
    .querySelectorAll<HTMLElement>('span[dir="ltr"], span[dir="auto"], :scope > span')
    .forEach((element) => {
      candidates.push(element);
    });

  uniqueElements(candidates).forEach((element) => {
    if (
      shouldIgnoreElement(element) ||
      element.matches('[data-testid="last-msg-status"]') ||
      element.closest('[aria-hidden="true"]') ||
      containsWhatsAppStatus(element) ||
      isLikelyTimeElement(element) ||
      !hasVisibleTextOrContent(element)
    ) {
      return;
    }

    applyBlur(element);
  });

  protectStatusInside(statusRoot);
}

function processFallbackPreviewText(container: HTMLElement): void {
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>('span[dir="ltr"], span[dir="auto"]'),
  );

  candidates.forEach((element) => {
    if (
      shouldIgnoreElement(element) ||
      element.closest('[aria-hidden="true"]') ||
      containsWhatsAppStatus(element) ||
      isLikelyTimeElement(element)
    ) {
      return;
    }

    applyBlur(element);
  });
}

function getChatPreviewElements(): HTMLElement[] {
  const elements: HTMLElement[] = [];
  CHAT_PREVIEW_SELECTORS.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      elements.push(element);
    });
  });
  return uniqueElements(elements);
}

/* =========================================================
 * PROFILE PICTURES
 * ========================================================= */

function processProfilePictures(): void {
  processSidebarAvatars();

  const elements = getProfilePictureElements();
  elements.forEach((element) => {
    if (
      shouldIgnoreElement(element) ||
      isInsideContactNameContainer(element) ||
      hasBlurredAncestor(element)
    ) {
      return;
    }

    applyBlur(element);
  });
}

function processSidebarAvatars(): void {
  const visualElements: HTMLElement[] = [];

  SIDEBAR_AVATAR_SELECTORS.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      if (shouldIgnoreElement(element) || isInsideContactNameContainer(element)) {
        return;
      }
      visualElements.push(element);
    });
  });

  uniqueElements(visualElements).forEach((element) => {
    applyBlur(element);
  });
}

function findSidebarAvatarWrapper(visual: HTMLElement): HTMLElement | null {
  return visual.parentElement || visual;
}

function getProfilePictureElements(): HTMLElement[] {
  const elements: HTMLElement[] = [];
  PROFILE_PICTURE_SELECTORS.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      elements.push(element);
    });
  });
  return uniqueElements(elements);
}

function cleanupSidebarAvatars(): void {
  SIDEBAR_AVATAR_SELECTORS.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      const wrapper = findSidebarAvatarWrapper(element);
      if (wrapper) {
        removeBlurDeep(wrapper);
      }
    });
  });
}

/* =========================================================
 * MEDIA
 * ========================================================= */

function processMedia(): void {
  const elements = getMediaElements();
  elements.forEach((element) => {
    if (
      shouldIgnoreElement(element) ||
      isInsideMessageMeta(element) ||
      isMessageStatusElement(element) ||
      isInsideContactNameContainer(element)
    ) {
      return;
    }

    applyBlur(element);
  });
}

function getMediaElements(): HTMLElement[] {
  const elements: HTMLElement[] = [];
  MEDIA_SELECTORS.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      elements.push(element);
    });
  });
  return uniqueElements(elements);
}

/* =========================================================
 * FILES
 * ========================================================= */

function processFiles(): void {
  const elements = getFileElements();
  elements.forEach((element) => {
    if (
      shouldIgnoreElement(element) ||
      isInsideMessageMeta(element) ||
      isMessageStatusElement(element)
    ) {
      return;
    }

    applyBlur(element);
  });
}

function getFileElements(): HTMLElement[] {
  const elements: HTMLElement[] = [];
  FILE_SELECTORS.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      elements.push(element);
    });
  });
  return uniqueElements(elements);
}

/* =========================================================
 * COMPOSE BOX
 * ========================================================= */

function processComposeBox(): void {
  const elements = getComposeBoxElements();
  elements.forEach((element) => {
    if (shouldIgnoreElement(element)) {
      return;
    }
    applyBlur(element);
  });
}

function getComposeBoxElements(): HTMLElement[] {
  const elements: HTMLElement[] = [];
  COMPOSE_BOX_SELECTORS.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      elements.push(element);
    });
  });
  return uniqueElements(elements);
}

/* =========================================================
 * PROTECTED METADATA
 * ========================================================= */

function cleanupProtectedMetadata(): void {
  MESSAGE_META_SELECTORS.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      removeBlurDeep(element);
    });
  });

  document.querySelectorAll<SVGElement>("svg title").forEach((svg) => {
    const title = svg.querySelector("title");
    if (!title || !isWhatsAppStatusTitle(title.textContent ?? "")) {
      return;
    }
    protectStatusSvg(svg);
  });

  const explicitStatusSelectors = [
    '[aria-label*="Dibaca" i]',
    '[aria-label*="Read" i]',
    '[aria-label*="Terkirim" i]',
    '[aria-label*="Delivered" i]',
    '[aria-label*="Sent" i]',
    '[data-icon*="check" i]',
    '[data-icon*="status" i]',
  ];

  explicitStatusSelectors.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      removeBlurDeep(element);
    });
  });

  document
    .querySelectorAll<HTMLElement>('[data-testid="cell-frame-primary-detail"]')
    .forEach((element) => {
      removeBlurDeep(element);
    });
}

function protectStatusSvg(svg: SVGElement): void {
  const statusRoot = svg.closest<HTMLElement>(
    ['[data-testid="msg-meta"]', '[data-testid="last-msg-status"]'].join(","),
  );

  if (!statusRoot) {
    if (svg instanceof HTMLElement) {
      removeBlur(svg);
    }
    if (svg.parentElement?.classList.contains(WHATSAPP_BLUR_CLASS)) {
      removeBlur(svg.parentElement);
    }
    return;
  }

  let current: HTMLElement | null = svg.parentElement;
  let depth = 0;

  while (current && depth < 4) {
    if (
      current.matches('[data-testid="selectable-text"]') ||
      current.matches('[data-testid="message-text"]')
    ) {
      break;
    }

    if (current === statusRoot) {
      removeBlur(current);
      break;
    }

    removeBlur(current);
    current = current.parentElement;
    depth += 1;
  }
}

function isInsideMessageMeta(element: Element): boolean {
  return Boolean(element.closest(MESSAGE_META_SELECTORS.join(",")));
}

function isMessageStatusElement(element: Element): boolean {
  if (containsWhatsAppStatus(element)) {
    return true;
  }
  const ariaLabel = element.getAttribute("aria-label") ?? "";
  return /dibaca|read|terkirim|delivered|sent/i.test(ariaLabel);
}

function containsWhatsAppStatus(element: Element): boolean {
  const titles = element.querySelectorAll("svg title");
  for (const title of Array.from(titles)) {
    if (isWhatsAppStatusTitle(title.textContent ?? "")) {
      return true;
    }
  }
  return false;
}

function isWhatsAppStatusTitle(title: string): boolean {
  const normalized = title.trim().toLowerCase();
  return STATUS_TITLE_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function protectStatusInside(container: HTMLElement): void {
  container.querySelectorAll<SVGElement>("svg title").forEach((svg) => {
    const title = svg.querySelector("title");
    if (!title || !isWhatsAppStatusTitle(title.textContent ?? "")) {
      return;
    }
    protectStatusSvg(svg);
  });
}

/* =========================================================
 * CATEGORY CLEANUP
 * ========================================================= */

function cleanupCategory(elements: HTMLElement[]): void {
  elements.forEach((element) => {
    removeBlurDeep(element);
  });
}

function removeBlurDeep(element: HTMLElement): void {
  removeBlur(element);
  element
    .querySelectorAll<HTMLElement>(`.${WHATSAPP_BLUR_CLASS}`)
    .forEach((child) => {
      removeBlur(child);
    });
}

function cleanupAllBlur(): void {
  document
    .querySelectorAll<HTMLElement>(`.${WHATSAPP_BLUR_CLASS}`)
    .forEach((element) => {
      removeBlur(element);
    });
}

/* =========================================================
 * GENERAL HELPERS
 * ========================================================= */

function shouldIgnoreElement(element: Element): boolean {
  if (element.matches(IGNORE_SELECTORS.join(","))) {
    return true;
  }
  if (element.closest(IGNORE_SELECTORS.join(","))) {
    return true;
  }
  return false;
}

function hasVisibleTextOrContent(element: HTMLElement): boolean {
  if (element.textContent?.trim()) {
    return true;
  }
  if (element.querySelector("img, svg, picture, video, canvas")) {
    return true;
  }
  return false;
}

function isInsideContactNameContainer(element: Element): boolean {
  if (element.tagName === "IMG" || element.tagName === "SVG") {
    return false;
  }
  return Boolean(
    element.closest(
      [
        '[data-testid="conversation-info-header-chat-title"]',
        '[data-testid="author"]',
        '[data-testid="cell-frame-title"] span[dir="auto"][title]',
      ].join(","),
    ),
  );
}

function hasBlurredAncestor(element: Element): boolean {
  let parent = element.parentElement;
  while (parent) {
    if (parent.classList.contains(WHATSAPP_BLUR_CLASS)) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

function isLikelyTimeElement(element: HTMLElement): boolean {
  if (element.matches('[data-testid="cell-frame-primary-detail"]')) {
    return true;
  }
  if (isInsideMessageMeta(element)) {
    return true;
  }
  const text = element.textContent?.trim() ?? "";
  return /^\d{1,2}[.:]\d{2}$/.test(text);
}

function uniqueElements(elements: HTMLElement[]): HTMLElement[] {
  return Array.from(new Set(elements));
}
