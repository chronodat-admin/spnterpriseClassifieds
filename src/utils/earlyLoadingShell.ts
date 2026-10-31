/**
 * Runs synchronously when the web part bundle first evaluates.
 * Hides SharePoint chrome and shows a loader before React mounts.
 */
const EARLY_STYLE_ID = 'ec365-early-loading-shell';
const FULLSCREEN_LOADER_ID = 'ec365-fullscreen-loader';
const EARLY_EDIT_STYLE_ID = 'ec365-early-edit-restore';
export const BODY_APP_LOADING_CLASS = 'ec365-app-loading';
export const BODY_HIDE_NAV_CLASS = 'ec365-hide-sp-left-nav';
export const BODY_HIDE_PAGE_BAR_CLASS = 'ec365-hide-sp-page-bar';
const BODY_SHAREPOINT_EDIT_CLASS = 'ec365-sharepoint-edit-mode';

const SHAREPOINT_LEFT_CHROME_SELECTORS = [
  '#sp-appBar',
  '[data-automation-id="appBar"]',
  '#spSiteHeader',
  '[data-automation-id="SiteHeader"]',
  '#spLeftNav',
  '#sideNavBox',
  'nav[aria-label="Site navigation"]',
  '[data-automation-id="sp-sidenav"]',
  '[data-automation-id="LeftNavigation"]'
];

function isLikelyTeamsEmbed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const href = window.location.href;
  const search = window.location.search;
  return /teams\.microsoft\.com/i.test(href) || /[?&]host=Teams/i.test(search);
}

function isLikelySharePointEditMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const locationText = `${window.location.search} ${window.location.hash}`.toLowerCase();
  return (
    /[?&#]mode=edit(?:&|#|$)/.test(locationText) ||
    /[?&#]pagemode=edit(?:&|#|$)/.test(locationText) ||
    /[?&#]action=edit(?:&|#|$)/.test(locationText)
  );
}

function buildEarlyEditRestoreRules(): string {
  const selectors = [
    '#spCommandBar',
    '#spPageChrome',
    '[data-automation-id="pageCommandBar"]',
    '[data-automation-id="PageCommandBar"]',
    '[data-automation-id="ModernCommandBar"]',
    '[data-automation-id="CommandBar"]',
    '[data-automation-id="CanvasControlBar"]',
    '[data-automation-id="TopContentActions"]'
  ];

  const showBlock = selectors.map(
    (selector) => `body.${BODY_SHAREPOINT_EDIT_CLASS} ${selector}`
  ).join(',\n    ');

  return `
    ${showBlock} {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      pointer-events: auto !important;
    }

    body.${BODY_SHAREPOINT_EDIT_CLASS},
    body.${BODY_SHAREPOINT_EDIT_CLASS} html {
      overflow: auto !important;
      height: auto !important;
    }`;
}

function ensureEarlyEditRestoreStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(EARLY_EDIT_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = EARLY_EDIT_STYLE_ID;
  style.textContent = buildEarlyEditRestoreRules();
  document.head.appendChild(style);
}

export function bootstrapSharePointEditMode(): void {
  if (typeof document === 'undefined' || !document.body || !isLikelySharePointEditMode()) {
    return;
  }

  document.body.classList.add(BODY_SHAREPOINT_EDIT_CLASS);
  document.body.classList.remove(BODY_APP_LOADING_CLASS);
  document.body.classList.remove(BODY_HIDE_NAV_CLASS);
  document.body.classList.remove(BODY_HIDE_PAGE_BAR_CLASS);
  ensureEarlyEditRestoreStyles();
}

function buildEarlyHideRules(): string {
  const hideBlock = SHAREPOINT_LEFT_CHROME_SELECTORS.map(
    selector => `body.${BODY_APP_LOADING_CLASS} ${selector}, body.${BODY_HIDE_NAV_CLASS} ${selector}`
  ).join(',\n    ');

  return `
    ${hideBlock} {
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      min-width: 0 !important;
      max-width: 0 !important;
      max-height: 0 !important;
      overflow: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    body.${BODY_APP_LOADING_CLASS} {
      background-color: #f5f5f5 !important;
    }

    body.${BODY_APP_LOADING_CLASS} #spPageCanvasContent,
    body.${BODY_APP_LOADING_CLASS} .SPCanvas-canvasContent,
    body.${BODY_APP_LOADING_CLASS} [data-automation-id="contentScrollRegion"] {
      margin-left: 0 !important;
      padding-left: 0 !important;
      left: 0 !important;
      max-width: 100% !important;
    }

    #${FULLSCREEN_LOADER_ID} {
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
    }
  `;
}

function ensureEarlyStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(EARLY_STYLE_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = EARLY_STYLE_ID;
  style.textContent = buildEarlyHideRules();
  document.head.appendChild(style);
}

function ensureFullScreenOverlay(): void {
  if (typeof document === 'undefined' || !document.body || document.getElementById(FULLSCREEN_LOADER_ID)) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = FULLSCREEN_LOADER_ID;
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-busy', 'true');
  overlay.setAttribute('aria-label', 'Loading Enterprise Classifieds 365');
  overlay.innerHTML =
    '<div style="display:flex;flex-direction:column;align-items:center;gap:16px;color:#616161;font-family:Segoe UI,sans-serif;font-size:14px">' +
    '<div style="width:32px;height:32px;border:3px solid #e0e0e0;border-top-color:#0078d4;border-radius:50%;animation:ec365-early-spin 0.9s linear infinite" aria-hidden="true"></div>' +
    '<span>Loading Enterprise Classifieds 365</span>' +
    '</div>';

  if (!document.getElementById('ec365-early-spin-keyframes')) {
    const spinStyle = document.createElement('style');
    spinStyle.id = 'ec365-early-spin-keyframes';
    spinStyle.textContent = '@keyframes ec365-early-spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(spinStyle);
  }

  document.body.appendChild(overlay);
  window.setTimeout(() => {
    document.getElementById(FULLSCREEN_LOADER_ID)?.remove();
    document.body.classList.remove(BODY_APP_LOADING_CLASS);
  }, 12000);
}

export function bootstrapEarlyLoadingShell(): void {
  if (
    typeof document === 'undefined' ||
    !document.body ||
    isLikelyTeamsEmbed() ||
    isLikelySharePointEditMode()
  ) {
    return;
  }
  document.body.classList.add(BODY_APP_LOADING_CLASS);
  document.body.classList.add(BODY_HIDE_NAV_CLASS);
  ensureEarlyStyles();
  ensureFullScreenOverlay();
}

export function removeEarlyLoadingShell(): void {
  if (typeof document === 'undefined' || !document.body) {
    return;
  }
  document.body.classList.remove(BODY_APP_LOADING_CLASS);
  document.body.classList.remove(BODY_HIDE_NAV_CLASS);
  document.body.classList.remove(BODY_HIDE_PAGE_BAR_CLASS);
  const overlay = document.getElementById(FULLSCREEN_LOADER_ID);
  overlay?.remove();
}

bootstrapSharePointEditMode();
bootstrapEarlyLoadingShell();
