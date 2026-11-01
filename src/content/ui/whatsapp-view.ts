import {
  getPrivacySettings,
  startPrivacyEngine,
  applySettingsDirectly,
  type PrivacyEngineSettings,
} from "../privacy/engine";
import { loadPrivacySettings } from "../../storage";
import { setWhatsAppButtonActive } from "./whatsapp-button";

type PrivacySettingId =
  | "master"
  | "messages"
  | "contactNames"
  | "profilePictures"
  | "media"
  | "files"
  | "chatPreview"
  | "composeBox"
  | "safeScreenShare";

interface PrivacySetting {
  id: Exclude<PrivacySettingId, "master">;
  title: string;
  iconSvg: string;
  badge?: string;
}

const PRIVACY_SETTINGS: PrivacySetting[] = [
  {
    id: "messages",
    title: "Messages",
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  },
  {
    id: "contactNames",
    title: "Contacts",
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>`,
  },
  {
    id: "profilePictures",
    title: "Avatars",
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle></svg>`,
  },
  {
    id: "media",
    title: "Media",
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
  },
  {
    id: "files",
    title: "Files",
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
  },
  {
    id: "chatPreview",
    title: "Preview",
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line></svg>`,
  },
  {
    id: "composeBox",
    title: "Typing",
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  },
  {
    id: "safeScreenShare",
    title: "Safe Mode",
    iconSvg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><circle cx="12" cy="10" r="2"></circle></svg>`,
    
  },
];

let whatsappView: HTMLDivElement | null = null;
let privacySettings: PrivacyEngineSettings = {
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

let masterEnabled = true;
let blurIntensity = 6;
const settingStates: Record<PrivacySettingId, boolean> = {
  master: true,
  messages: false,
  contactNames: false,
  profilePictures: false,
  media: false,
  files: false,
  chatPreview: false,
  composeBox: false,
  safeScreenShare: false,
};

function initializePrivacyState(): void {
  const current = getPrivacySettings();
  if (current) {
    privacySettings = { ...privacySettings, ...current };
  }
  masterEnabled = privacySettings.enabled;
  blurIntensity = privacySettings.blurIntensity;

  settingStates.master = masterEnabled;
  settingStates.messages = privacySettings.messages;
  settingStates.contactNames = privacySettings.contactNames;
  settingStates.profilePictures = privacySettings.profilePictures;
  settingStates.media = privacySettings.media;
  settingStates.files = privacySettings.files;
  settingStates.chatPreview = privacySettings.chatPreview;
  settingStates.composeBox = privacySettings.composeBox;
  settingStates.safeScreenShare = privacySettings.safeScreenShare;
}

function buildPrivacySettings(): PrivacyEngineSettings {
  return {
    enabled: masterEnabled,
    messages: settingStates.messages,
    contactNames: settingStates.contactNames,
    profilePictures: settingStates.profilePictures,
    media: settingStates.media,
    files: settingStates.files,
    chatPreview: settingStates.chatPreview,
    composeBox: settingStates.composeBox,
    safeScreenShare: settingStates.safeScreenShare,
    blurIntensity,
  };
}

/**
 * Real-time instant visual application
 */
function applyPrivacySettings(): void {
  privacySettings = buildPrivacySettings();
  document.documentElement.style.setProperty(
    "--whatsapp-blur",
    `${privacySettings.blurIntensity}px`,
  );

  // Directly apply to DOM synchronously without waiting for storage promises
  applySettingsDirectly(privacySettings);
  updateSimulatorVisuals();
}

export function openWhatsAppView(): void {
  if (whatsappView && whatsappView.isConnected) {
    closeWhatsAppView();
    return;
  }

  initializePrivacyState();
  startPrivacyEngine(privacySettings);

  whatsappView = createWhatsAppView();
  document.body.appendChild(whatsappView);
  setWhatsAppButtonActive(true);
  updateSettingsAvailability();
  updateSimulatorVisuals();
}

export function closeWhatsAppView(): void {
  if (!whatsappView) return;
  if (whatsappView.isConnected) {
    whatsappView.remove();
  }
  whatsappView = null;
  setWhatsAppButtonActive(false);
}

let isShowingAbout = false;

function createWhatsAppView(): HTMLDivElement {
  isShowingAbout = false;
  const view = document.createElement("div");
  view.setAttribute("data-whatsapp", "view");

  const header = createHeader();
  view.appendChild(header);

  const content = document.createElement("main");
  content.setAttribute("data-whatsapp", "view-content");
  content.id = "waMainContent";

  // 1. Live Interactive Shield Simulator
  content.appendChild(createLiveSimulator());

  // 2. Master Card
  content.appendChild(createMasterCard());

  // 3. Quick Presets Bar
  content.appendChild(createPresetsBar());

  // 4. Compact 2-Column Settings Grid
  content.appendChild(createSettingsGrid());

  // 5. Precision Intensity Slider
  content.appendChild(createIntensitySection());

  view.appendChild(content);

  // About View (hidden by default)
  const aboutView = createAboutView();
  view.appendChild(aboutView);

  // 6. Pinned Footer (Always visible without scrolling)
  view.appendChild(createFooter());

  // Enable dragging the entire dashboard anywhere on screen
  makeDraggable(view, header);

  return view;
}

function makeDraggable(element: HTMLElement, handle: HTMLElement): void {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  handle.addEventListener("pointerdown", (e: PointerEvent) => {
    // If clicking a button or link, don't drag
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) {
      return;
    }

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = element.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    // Switch to absolute/fixed left/top coordinates
    element.style.right = "auto";
    element.style.bottom = "auto";
    element.style.left = `${initialLeft}px`;
    element.style.top = `${initialTop}px`;
    handle.style.cursor = "grabbing";

    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  });

  handle.addEventListener("pointermove", (e: PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newLeft = initialLeft + deltaX;
    let newTop = initialTop + deltaY;

    const maxLeft = Math.max(0, window.innerWidth - element.offsetWidth - 8);
    const maxTop = Math.max(0, window.innerHeight - element.offsetHeight - 8);

    newLeft = Math.max(8, Math.min(newLeft, maxLeft));
    newTop = Math.max(8, Math.min(newTop, maxTop));

    element.style.left = `${newLeft}px`;
    element.style.top = `${newTop}px`;
  });

  const stopDrag = (e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    handle.style.cursor = "grab";
    try {
      handle.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  handle.addEventListener("pointerup", stopDrag);
  handle.addEventListener("pointercancel", stopDrag);
}

function toggleAboutView(): void {
  isShowingAbout = !isShowingAbout;
  const mainContent = document.getElementById("waMainContent");
  const aboutView = document.getElementById("waAboutView");
  const titleText = document.querySelector<HTMLElement>('[data-whatsapp="view-title"]');
  const btnAbout = document.getElementById("btnHeaderAbout");

  if (mainContent && aboutView) {
    if (isShowingAbout) {
      mainContent.style.display = "none";
      aboutView.style.display = "flex";
      if (titleText) titleText.textContent = "About Extension";
      if (btnAbout) btnAbout.setAttribute("aria-pressed", "true");
    } else {
      mainContent.style.display = "flex";
      aboutView.style.display = "none";
      if (titleText) titleText.textContent = "WhatsApp Assistant";
      if (btnAbout) btnAbout.setAttribute("aria-pressed", "false");
    }
  }
}

function createHeader(): HTMLElement {
  const header = document.createElement("header");
  header.setAttribute("data-whatsapp", "view-header");

  const left = document.createElement("div");
  left.className = "header-left";

  const logoIcon = document.createElement("div");
  logoIcon.className = "header-logo-icon";
  logoIcon.innerHTML = `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00FFA3" />
          <stop offset="45%" stop-color="#25D366" />
          <stop offset="100%" stop-color="#00D2FF" />
        </linearGradient>
      </defs>
      <path d="M12 1.5L21.5 4.8V11.8C21.5 17.5 17.2 22 12 23.2C6.8 22 2.5 17.5 2.5 11.8V4.8L12 1.5Z" fill="url(#headerGrad)" stroke="#ffffff" stroke-width="0.8" stroke-linejoin="round"/>
      <path d="M12 5.5C8.4 5.5 5.5 8.4 5.5 12C5.5 13.2 5.85 14.3 6.45 15.25L5.5 18.5L8.75 17.75C9.7 18.4 10.8 18.5 12 18.5C15.6 18.5 18.5 15.6 18.5 12C18.5 8.4 15.6 5.5 12 5.5Z" fill="#111b21"/>
      <path d="M14.2 13.5c-.15-.08-.9-.45-1.04-.5-.14-.05-.24-.08-.34.08-.1.15-.39.5-.48.6-.09.1-.18.12-.33.04-.15-.08-.64-.24-1.22-.76-.45-.4-.76-.9-.85-1.05-.09-.15-.01-.23.07-.31.07-.07.15-.18.23-.27.08-.09.1-.15.15-.25.05-.1.03-.19-.01-.27-.04-.08-.34-.83-.47-1.13-.12-.3-.25-.26-.34-.26-.09 0-.19 0-.29 0-.1 0-.27.04-.41.19-.14.15-.53.52-.53 1.27 0 .75.55 1.48.62 1.58.08.1 1.07 1.64 2.6 2.3.36.16.65.25.87.32.36.12.7.1 .96.06.3-.04.9-.37 1.03-.73.13-.36.13-.66.09-.73-.04-.06-.14-.1-.29-.18z" fill="#FFFFFF"/>
    </svg>
  `;

  const heading = document.createElement("div");
  heading.innerHTML = `
    <div class="title-pill">
      <h1 data-whatsapp="view-title">WhatsApp Assistant</h1>
      <span class="badge-version">v2.1.0</span>
    </div>
  `;

  left.appendChild(logoIcon);
  left.appendChild(heading);

  const actions = document.createElement("div");
  actions.className = "header-actions";

  const aboutButton = document.createElement("button");
  aboutButton.type = "button";
  aboutButton.id = "btnHeaderAbout";
  aboutButton.setAttribute("aria-label", "About WhatsApp Assistant");
  aboutButton.setAttribute("title", "Tentang WhatsApp Assistant");
  aboutButton.className = "btn-header-action btn-header-about";
  aboutButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg><span>About</span>`;
  aboutButton.addEventListener("click", () => toggleAboutView());

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.id = "btnHeaderClose";
  closeButton.setAttribute("aria-label", "Close");
  closeButton.setAttribute("title", "Tutup Dashboard");
  closeButton.className = "btn-header-action btn-header-close";
  closeButton.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  closeButton.addEventListener("click", () => closeWhatsAppView());

  actions.appendChild(aboutButton);
  actions.appendChild(closeButton);

  header.appendChild(left);
  header.appendChild(actions);
  return header;
}

function createAboutView(): HTMLElement {
  const container = document.createElement("div");
  container.className = "about-container";
  container.id = "waAboutView";
  container.style.display = "none";

  container.innerHTML = `
    <div class="about-hero">
      <div class="about-hero-logo">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none">
          <defs>
            <linearGradient id="aboutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00FFA3" />
              <stop offset="45%" stop-color="#25D366" />
              <stop offset="100%" stop-color="#00D2FF" />
            </linearGradient>
          </defs>
          <path d="M12 1.5L21.5 4.8V11.8C21.5 17.5 17.2 22 12 23.2C6.8 22 2.5 17.5 2.5 11.8V4.8L12 1.5Z" fill="url(#aboutGrad)" stroke="#ffffff" stroke-width="0.8" stroke-linejoin="round"/>
          <path d="M12 5.5C8.4 5.5 5.5 8.4 5.5 12C5.5 13.2 5.85 14.3 6.45 15.25L5.5 18.5L8.75 17.75C9.7 18.4 10.8 18.5 12 18.5C15.6 18.5 18.5 15.6 18.5 12C18.5 8.4 15.6 5.5 12 5.5Z" fill="#111b21"/>
          <path d="M14.2 13.5c-.15-.08-.9-.45-1.04-.5-.14-.05-.24-.08-.34.08-.1.15-.39.5-.48.6-.09.1-.18.12-.33.04-.15-.08-.64-.24-1.22-.76-.45-.4-.76-.9-.85-1.05-.09-.15-.01-.23.07-.31.07-.07.15-.18.23-.27.08-.09.1-.15.15-.25.05-.1.03-.19-.01-.27-.04-.08-.34-.83-.47-1.13-.12-.3-.25-.26-.34-.26-.09 0-.19 0-.29 0-.1 0-.27.04-.41.19-.14.15-.53.52-.53 1.27 0 .75.55 1.48.62 1.58.08.1 1.07 1.64 2.6 2.3.36.16.65.25.87.32.36.12.7.1 .96.06.3-.04.9-.37 1.03-.73.13-.36.13-.66.09-.73-.04-.06-.14-.1-.29-.18z" fill="#FFFFFF"/>
        </svg>
      </div>
      <h2 class="about-title">WhatsApp Assistant</h2>
      <span class="about-tagline">Next-Generation Visual Privacy & Screen Shield</span>
      <div class="about-badges">
        <span class="about-badge">v2.1.0</span>
        <span class="about-badge-green">100% Local</span>
        <span class="about-badge-blue">Manifest V3</span>
      </div>
    </div>

    <div class="about-cards-list">
      <div class="about-card">
        <strong>🔒 Zero-Knowledge Privacy</strong>
        <p>Ekstensi berjalan 100% lokal di browser Anda. Tidak ada server eksternal, akun login, maupun pengumpulan data apa pun.</p>
      </div>
      <div class="about-card">
        <strong>⌨️ Pintasan Keyboard Global</strong>
        <p>Gunakan <code>Ctrl + Shift + U</code> untuk mengaktifkan atau menonaktifkan Master Privacy Shield secara instan.</p>
      </div>
      <div class="about-card">
        <strong>👨‍💻 Developer & Official Links</strong>
        <div class="about-links">
          <a href="https://wa.me/6282287592930" target="_blank" rel="noopener noreferrer" class="about-link-pill link-wa">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span class="link-label">WhatsApp</span>
          </a>
          <a href="https://github.com/notbell1/whatsapp-assistant" target="_blank" rel="noopener noreferrer" class="about-link-pill link-github">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <span class="link-label">Repository</span>
          </a>
          <a href="https://www.instagram.com/_ntbbll" target="_blank" rel="noopener noreferrer" class="about-link-pill link-ig">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span class="link-label">Instagram</span>
          </a>
          <a href="https://t.me/bellxss" target="_blank" rel="noopener noreferrer" class="about-link-pill link-tele">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#229ED9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            <span class="link-label">Telegram</span>
          </a>
        </div>
      </div>

      <div class="about-card report-bug-card">
        <div class="report-header">
          <strong>🐛 Lapor Bug / Kendala</strong>
          <span class="report-badge">WhatsApp Support</span>
        </div>
        <p>Menemukan bug atau kendala tampilan? Tuliskan deskripsinya di bawah untuk kirim laporan otomatis ke developer via WhatsApp.</p>
        <div class="bug-input-group">
          <textarea id="bugTextInput" class="bug-textarea" rows="2" placeholder="Tulis kendala (opsional, contoh: foto profil di grup belum ter-blur)..."></textarea>
          <a id="btnSendBugReport" href="https://wa.me/6282287592930?text=Halo%20Developer%20Nttbell%20Assistant%2C%20saya%20menemukan%20kendala%20saat%20menggunakan%20ekstensi%20WhatsApp%20Assistant%20v2.1.0." target="_blank" rel="noopener noreferrer" class="btn-report-wa">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span>Kirim Laporan via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>

    <button type="button" class="btn-about-back" id="btnBackToControls">
      <span>← Kembali ke Pengaturan</span>
    </button>
  `;

  const btnBack = container.querySelector<HTMLButtonElement>("#btnBackToControls");
  if (btnBack) {
    btnBack.addEventListener("click", () => toggleAboutView());
  }

  const bugInput = container.querySelector<HTMLTextAreaElement>("#bugTextInput");
  const btnSendBug = container.querySelector<HTMLAnchorElement>("#btnSendBugReport");

  if (bugInput && btnSendBug) {
    const updateBugLink = () => {
      const detail = bugInput.value.trim();
      let message = "";
      if (detail) {
        message = `Halo Developer Nttbell Assistant, saya menemukan bug pada WhatsApp Assistant v2.1.0:\n\n*Kendala:*\n${detail}\n\n*Platform:* WhatsApp Web (Chrome)`;
      } else {
        message = `Halo Developer Nttbell Assistant, saya menemukan kendala/bug saat menggunakan ekstensi WhatsApp Assistant v2.1.0 di WhatsApp Web. Mohon bantuannya!`;
      }
      btnSendBug.href = `https://wa.me/6282287592930?text=${encodeURIComponent(message)}`;
    };

    bugInput.addEventListener("input", updateBugLink);
    btnSendBug.addEventListener("click", updateBugLink);
  }

  return container;
}

function isMetaAiElement(el: Element | null): boolean {
  if (!el) return false;
  if (
    el.closest('[aria-label*="Meta AI" i]') ||
    el.closest('[aria-label*="Meta" i]') ||
    el.closest('[data-testid*="meta" i]') ||
    el.closest('button[aria-label*="Meta" i]')
  ) {
    return true;
  }
  const alt = (el.getAttribute("alt") ?? "").toLowerCase();
  const title = (el.getAttribute("title") ?? "").toLowerCase();
  const ariaLabel = (el.getAttribute("aria-label") ?? "").toLowerCase();
  const src = ((el as HTMLImageElement).src ?? "").toLowerCase();

  return (
    alt.includes("meta") ||
    title.includes("meta") ||
    ariaLabel.includes("meta") ||
    src.includes("meta")
  );
}

function getSelfProfileInfo(): { name: string; avatarSrc: string | null } {
  // Specifically search for User Profile (excluding Meta AI)
  const profileSelectors = [
    'button[aria-label="Profile" i] img',
    'button[aria-label="Profil" i] img',
    'button[aria-label*="Profile" i] img',
    'button[aria-label*="Profil" i] img',
    '[data-testid="navbar-profile-button"] img',
    '[data-testid="menu-bar-user-avatar"] img',
    '[data-testid="navbar-bottom-section"] img',
    '#side header img',
    '[data-testid="chatlist-header"] [role="button"] img',
  ];

  let avatarSrc: string | null = null;
  for (const selector of profileSelectors) {
    const images = document.querySelectorAll<HTMLImageElement>(selector);
    for (const img of Array.from(images)) {
      if (
        img &&
        img.src &&
        !img.src.includes("data:image/svg") &&
        !isMetaAiElement(img)
      ) {
        avatarSrc = img.src;
        break;
      }
    }
    if (avatarSrc) break;
  }

  // Detect self name"
  let name = "Anda (Preview)";
  const selfChat = document.querySelector(
    '[data-testid="cell-frame-title"] span[title*="You" i], [data-testid="cell-frame-title"] span[title*="Anda" i]'
  );
  if (selfChat && selfChat.getAttribute("title")) {
    name = selfChat.getAttribute("title")!;
  }

  return {
    name,
    avatarSrc,
  };
}

function createLiveSimulator(): HTMLElement {
  const card = document.createElement("section");
  card.className = "simulator-card";
  card.id = "waSimulatorCard";

  const header = document.createElement("div");
  header.className = "simulator-header";
  header.innerHTML = `
    <span>Preview</span>
    <span class="simulator-pulse"><span class="pulse-dot"></span> REALTIME</span>
  `;

  const profile = getSelfProfileInfo();

  const body = document.createElement("div");
  body.className = "simulator-body";
  
  const avatarContent = profile.avatarSrc
    ? `<img src="${profile.avatarSrc}" alt="Avatar" class="sim-avatar-img" />`
    : `<div class="sim-avatar-user-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>`;

  body.innerHTML = `
    <div class="sim-avatar" id="simAvatar">${avatarContent}</div>
    <div class="sim-chat">
      <strong class="sim-name" id="simName">${profile.name}</strong>
      <span class="sim-msg" id="simMsg">Pesan / Catatan Pribadi</span>
    </div>
  `;

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

function updateSimulatorVisuals(): void {
  const avatar = document.getElementById("simAvatar");
  const name = document.getElementById("simName");
  const msg = document.getElementById("simMsg");
  if (!avatar || !name || !msg) return;

  // Refresh user avatar dynamically if newly loaded and not Meta AI
  const profile = getSelfProfileInfo();
  if (profile.avatarSrc && !avatar.querySelector("img")) {
    avatar.innerHTML = `<img src="${profile.avatarSrc}" alt="Avatar" class="sim-avatar-img" />`;
  }
  if (profile.name && name.textContent === "Anda (Profil Saya)" && profile.name !== "Anda (Profil Saya)") {
    name.textContent = profile.name;
  }

  const isEnabled = masterEnabled;
  const blurVal = `${blurIntensity}px`;

  // Avatar blur
  if (isEnabled && settingStates.profilePictures) {
    avatar.style.filter = `blur(${blurVal}) grayscale(25%)`;
  } else {
    avatar.style.filter = "none";
  }

  // Name blur
  if (isEnabled && settingStates.contactNames) {
    name.style.filter = `blur(${blurVal}) grayscale(25%)`;
  } else {
    name.style.filter = "none";
  }

  // Message blur
  if (isEnabled && settingStates.messages) {
    msg.style.filter = `blur(${blurVal}) grayscale(25%)`;
  } else {
    msg.style.filter = "none";
  }
}

function createMasterCard(): HTMLElement {
  const card = document.createElement("section");
  card.setAttribute("data-whatsapp", "master-card");
  card.setAttribute("data-enabled", String(masterEnabled));

  const left = document.createElement("div");
  left.setAttribute("data-whatsapp", "master-info");

  const icon = document.createElement("div");
  icon.setAttribute("data-whatsapp", "master-icon");
  icon.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `;

  const text = document.createElement("div");
  text.setAttribute("data-whatsapp", "master-text");
  text.innerHTML = `
    <strong>Master Shield</strong>
    <span data-whatsapp="master-status">${masterEnabled ? "Active" : "Disabled"}</span>
  `;

  left.appendChild(icon);
  left.appendChild(text);

  const toggle = createSwitch("master", masterEnabled);
  toggle.addEventListener("click", () => {
    masterEnabled = !masterEnabled;
    settingStates.master = masterEnabled;

    toggle.setAttribute("aria-pressed", String(masterEnabled));
    updateMasterCard(card);
    applyPrivacySettings();
    updateSettingsAvailability();
  });

  card.appendChild(left);
  card.appendChild(toggle);
  return card;
}

function updateMasterCard(card: HTMLElement): void {
  const status = card.querySelector<HTMLElement>('[data-whatsapp="master-status"]');
  const toggle = card.querySelector<HTMLButtonElement>('[data-whatsapp="switch"]');

  if (status) {
    status.textContent = masterEnabled
      ? "Active"
      : "Disabled";
  }

  if (toggle) {
    toggle.setAttribute("aria-pressed", String(masterEnabled));
  }

  card.setAttribute("data-enabled", String(masterEnabled));
}

function createPresetsBar(): HTMLElement {
  const bar = document.createElement("div");
  bar.className = "presets-bar";

  const presets = [
    {
      label: "🛡️ Enhanced",
      apply: () => {
        masterEnabled = true;
        settingStates.master = true;
        settingStates.messages = true;
        settingStates.contactNames = true;
        settingStates.profilePictures = true;
        settingStates.media = true;
        settingStates.files = true;
        settingStates.chatPreview = true;
        settingStates.composeBox = false;
        settingStates.safeScreenShare = false;
        blurIntensity = 8;
      },
    },
    {
      label: "💼 Screen-Share",
      apply: () => {
        masterEnabled = true;
        settingStates.master = true;
        settingStates.messages = true;
        settingStates.contactNames = true;
        settingStates.profilePictures = true;
        settingStates.media = true;
        settingStates.files = true;
        settingStates.chatPreview = true;
        settingStates.composeBox = true;
        settingStates.safeScreenShare = true;
        blurIntensity = 8;
      },
    },
    {
      label: "👁️ Chat Only",
      apply: () => {
        masterEnabled = true;
        settingStates.master = true;
        settingStates.messages = true;
        settingStates.contactNames = true;
        settingStates.profilePictures = false;
        settingStates.media = true;
        settingStates.files = true;
        settingStates.chatPreview = true;
        settingStates.composeBox = false;
        settingStates.safeScreenShare = false;
        blurIntensity = 6;
      },
    },
    {
      label: "🔄 Reset",
      apply: () => {
        masterEnabled = true;
        settingStates.master = true;
        settingStates.messages = false;
        settingStates.contactNames = false;
        settingStates.profilePictures = false;
        settingStates.media = false;
        settingStates.files = false;
        settingStates.chatPreview = false;
        settingStates.composeBox = false;
        settingStates.safeScreenShare = false;
        blurIntensity = 6;
      },
    },
  ];

  presets.forEach((p) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "preset-chip";
    chip.textContent = p.label;
    chip.addEventListener("click", () => {
      p.apply();
      applyPrivacySettings();
      syncFullUIState();
    });
    bar.appendChild(chip);
  });

  return bar;
}

function createSettingsGrid(): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "settings-grid";
  grid.setAttribute("data-group", "settings");

  for (const setting of PRIVACY_SETTINGS) {
    grid.appendChild(createSettingTile(setting));
  }

  return grid;
}

function createSettingTile(setting: PrivacySetting): HTMLDivElement {
  const tile = document.createElement("div");
  tile.setAttribute("data-whatsapp", "setting-row");
  tile.setAttribute("data-setting-id", setting.id);

  const left = document.createElement("div");
  left.className = "setting-left";

  const icon = document.createElement("div");
  icon.setAttribute("data-whatsapp", "setting-icon");
  icon.innerHTML = setting.iconSvg;

  const text = document.createElement("div");
  text.setAttribute("data-whatsapp", "setting-text");
  const badgeHtml = setting.badge
    ? `<span class="whatsapp-shield-badge">${setting.badge}</span>`
    : "";
  text.innerHTML = `<strong>${setting.title}${badgeHtml}</strong>`;

  left.appendChild(icon);
  left.appendChild(text);

  const toggle = createSwitch(setting.id, settingStates[setting.id]);
  toggle.addEventListener("click", () => {
    settingStates[setting.id] = !settingStates[setting.id];

    if (settingStates[setting.id] && setting.id !== "safeScreenShare") {
      masterEnabled = true;
      settingStates.master = true;
    } else if (setting.id !== "safeScreenShare") {
      const anyCategoryEnabled = PRIVACY_SETTINGS.some(
        (item) => item.id !== "safeScreenShare" && settingStates[item.id],
      );
      if (!anyCategoryEnabled) {
        masterEnabled = false;
        settingStates.master = false;
      }
    }

    toggle.setAttribute("aria-pressed", String(settingStates[setting.id]));
    applyPrivacySettings();

    const masterCard = document.querySelector<HTMLElement>(
      '[data-whatsapp="master-card"]',
    );
    if (masterCard) updateMasterCard(masterCard);
    updateSettingsAvailability();
  });

  tile.appendChild(left);
  tile.appendChild(toggle);
  return tile;
}

function createSwitch(
  id: PrivacySettingId,
  enabled: boolean,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("data-whatsapp", "switch");
  button.setAttribute("data-switch-id", id);
  button.setAttribute("aria-pressed", String(enabled));

  const track = document.createElement("span");
  track.setAttribute("data-whatsapp", "switch-track");
  const thumb = document.createElement("span");
  thumb.setAttribute("data-whatsapp", "switch-thumb");

  track.appendChild(thumb);
  button.appendChild(track);
  return button;
}

function createIntensitySection(): HTMLElement {
  const section = document.createElement("div");
  section.setAttribute("data-whatsapp", "intensity");
  section.setAttribute("data-group", "intensity");

  const header = document.createElement("div");
  header.setAttribute("data-whatsapp", "intensity-header");
  header.innerHTML = `
    <div data-whatsapp="intensity-text">
      <strong>Blur Intensity</strong>
    </div>
    <span data-whatsapp="blur-value">${blurIntensity}px</span>
  `;

  const controls = document.createElement("div");
  controls.className = "slider-controls";

  const btnMinus = document.createElement("button");
  btnMinus.type = "button";
  btnMinus.className = "btn-step";
  btnMinus.textContent = "-";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "2";
  slider.max = "16";
  slider.step = "1";
  slider.value = String(blurIntensity);
  slider.setAttribute("data-whatsapp", "blur-slider");

  const btnPlus = document.createElement("button");
  btnPlus.type = "button";
  btnPlus.className = "btn-step";
  btnPlus.textContent = "+";

  const valueDisplay = header.querySelector<HTMLElement>(
    '[data-whatsapp="blur-value"]',
  )!;

  const updateIntensityValue = (newVal: number) => {
    blurIntensity = Math.max(2, Math.min(16, newVal));
    slider.value = String(blurIntensity);
    valueDisplay.textContent = `${blurIntensity}px`;
    applyPrivacySettings();
  };

  slider.addEventListener("input", () => {
    updateIntensityValue(Number(slider.value));
  });

  btnMinus.addEventListener("click", () => {
    updateIntensityValue(blurIntensity - 1);
  });

  btnPlus.addEventListener("click", () => {
    updateIntensityValue(blurIntensity + 1);
  });

  controls.appendChild(btnMinus);
  controls.appendChild(slider);
  controls.appendChild(btnPlus);

  section.appendChild(header);
  section.appendChild(controls);

  return section;
}

function createFooter(): HTMLDivElement {
  const footer = document.createElement("div");
  footer.setAttribute("data-whatsapp", "footer");
  footer.innerHTML = `
    <span>Created by <a href="https://www.instagram.com/_ntbbll" target="_blank" rel="noopener noreferrer" class="footer-link-highlight">Nttbell</a></span>
  `;
  return footer;
}

function updateSettingsAvailability(): void {
  const isMasterActive = masterEnabled;

  const settingsGroup = document.querySelector<HTMLElement>(
    '[data-group="settings"]',
  );
  const intensityGroup = document.querySelector<HTMLElement>(
    '[data-group="intensity"]',
  );

  if (settingsGroup) {
    settingsGroup.setAttribute("data-master-active", String(isMasterActive));
    const toggles = settingsGroup.querySelectorAll<HTMLButtonElement>(
      'button[data-whatsapp="switch"]',
    );
    toggles.forEach((btn) => {
      btn.disabled = !isMasterActive;
    });
  }

  if (intensityGroup) {
    intensityGroup.setAttribute("data-master-active", String(isMasterActive));
    const buttons = intensityGroup.querySelectorAll<HTMLButtonElement>("button");
    const slider = intensityGroup.querySelector<HTMLInputElement>(
      'input[data-whatsapp="blur-slider"]',
    );
    buttons.forEach((b) => (b.disabled = !isMasterActive));
    if (slider) slider.disabled = !isMasterActive;
  }
}

function showWhatsAppToast(message: string, isActive: boolean): void {
  const existingToast = document.getElementById("whatsapp-assistant-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.id = "whatsapp-assistant-toast";
  toast.setAttribute("data-whatsapp", "toast");
  toast.setAttribute("data-active", String(isActive));

  const icon = isActive
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="4" y1="4" x2="20" y2="20"/></svg>`;

  toast.innerHTML = `
    <div data-whatsapp="toast-icon">${icon}</div>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  void toast.offsetWidth;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 2500);
  }, 2200);
}

function syncFullUIState(): void {
  const masterCard = document.querySelector<HTMLElement>(
    '[data-whatsapp="master-card"]',
  );
  if (masterCard) {
    updateMasterCard(masterCard);
  }

  for (const setting of PRIVACY_SETTINGS) {
    const btn = document.querySelector<HTMLButtonElement>(
      `[data-switch-id="${setting.id}"]`,
    );
    if (btn) {
      btn.setAttribute("aria-pressed", String(settingStates[setting.id]));
    }
  }

  const slider = document.querySelector<HTMLInputElement>(
    'input[data-whatsapp="blur-slider"]',
  );
  const valueDisplay = document.querySelector<HTMLElement>(
    '[data-whatsapp="blur-value"]',
  );
  if (slider && valueDisplay) {
    slider.value = String(blurIntensity);
    valueDisplay.textContent = `${blurIntensity}px`;
  }

  updateSettingsAvailability();
  updateSimulatorVisuals();
}

/**
 * Global Keyboard & Message listeners
 */
export function initWhatsAppGlobalShortcuts(): void {
  initializePrivacyState();

  document.documentElement.style.setProperty(
    "--whatsapp-blur",
    `${blurIntensity}px`,
  );

  // Top-level Capture Phase listener (works on both window and document)
  const handleToggleShortcut = (event: KeyboardEvent) => {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const isKeyU =
      event.code === "KeyU" ||
      event.keyCode === 85 ||
      event.which === 85 ||
      event.key === "u" ||
      event.key === "U" ||
      event.key === "\x15";

    if (isCtrlOrCmd && isShift && isKeyU) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      masterEnabled = !masterEnabled;
      settingStates.master = masterEnabled;

      applyPrivacySettings();

      showWhatsAppToast(
        masterEnabled ? "WhatsApp Assistant: ON" : "WhatsApp Assistant: OFF",
        masterEnabled,
      );

      syncFullUIState();
    } else if (event.key === "Escape" && whatsappView && whatsappView.isConnected) {
      closeWhatsAppView();
    }
  };

  window.addEventListener("keydown", handleToggleShortcut, true);
  document.addEventListener("keydown", handleToggleShortcut, true);

  // Message listener from background service worker and popup
  try {
    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        try {
          if (!chrome.runtime?.id) return;
          if (message?.type === "WA_ASSISTANT_TOGGLE_PRIVACY") {
            masterEnabled = !masterEnabled;
            settingStates.master = masterEnabled;

            applyPrivacySettings();

            showWhatsAppToast(
              masterEnabled ? "WhatsApp Assistant: ON" : "WhatsApp Assistant: OFF",
              masterEnabled,
            );

            syncFullUIState();
            sendResponse({ success: true, enabled: masterEnabled });
          } else if (message?.type === "WA_ASSISTANT_SETTINGS_CHANGED") {
            void loadPrivacySettings().then((loaded) => {
              privacySettings = { ...loaded };
              initializePrivacyState();
              applyPrivacySettings();
              syncFullUIState();
              sendResponse({ success: true });
            });
            return true;
          }
        } catch {
          // Extension context invalidated
        }
      });
    }
  } catch {
    // Extension context invalidated
  }
}
