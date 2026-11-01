import { PRIVACY_SELECTORS } from "./selectors";

export type PrivacyTargetType =
  | "messages"
  | "contactNames"
  | "profilePictures"
  | "media"
  | "files"
  | "chatPreview"
  | "composeBox";

export const TARGET_MAP: Record<PrivacyTargetType, readonly string[]> = {
  messages: PRIVACY_SELECTORS.messageText,
  contactNames: PRIVACY_SELECTORS.contactNames,
  profilePictures: PRIVACY_SELECTORS.profilePictures,
  media: PRIVACY_SELECTORS.media,
  files: PRIVACY_SELECTORS.files,
  chatPreview: PRIVACY_SELECTORS.chatPreviewText,
  composeBox: PRIVACY_SELECTORS.composeBox,
};

export const STATUS_SELECTOR_LIST = [
  '[data-testid*="status" i]',
  '[data-testid*="check" i]',

  '[aria-label*="sent" i]',
  '[aria-label*="delivered" i]',
  '[aria-label*="read" i]',
  '[aria-label*="played" i]',

  '[aria-label*="terkirim" i]',
  '[aria-label*="dibaca" i]',

  '[title*="sent" i]',
  '[title*="delivered" i]',
  '[title*="read" i]',
  '[title*="played" i]',

  '[title*="terkirim" i]',
  '[title*="dibaca" i]',
];

export const STATUS_TITLE_KEYWORDS = [
  "wds-ic-delivered",
  "wds-ic-read",
  "wds-ic-sent",
  "wds-ic-check",
  "wds-ic-double-check",
  "wds-ic-played",
];

export const MESSAGE_META_SELECTORS = [
  '[data-testid="msg-meta"]',
  '[data-testid*="msg-meta" i]',
];
