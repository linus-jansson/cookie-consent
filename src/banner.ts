import type { AllConsentNames, Translations } from "c15t";

export function injectStyles() {
  if (document.getElementById("c15t-banner-styles")) return;
  const style = document.createElement("style");
  style.id = "c15t-banner-styles";
  style.textContent = `
/* ===== Cookie banner (dsc) — uses --ds variables ===== */

/* Root */
.dsc-cookiealert{
  position: fixed; inset: auto 0 0 0;
  z-index: 9999;
  animation: dsc-slide-up 300ms ease-out forwards;
  will-change: transform;
  background: var(--ds-color-background-default);
  color: var(--ds-color-text-default);
  box-shadow: var(--ds-shadow-xl);
}

/* Container */
.dsc-cookiealert__inner{
  max-width: 72rem;
  margin-inline: auto;
  padding: var(--ds-size-4);
}

/* Layout */
.dsc-cookiealert__body{
  display: flex;
  flex-direction: column;
  gap: var(--ds-size-4);
}

@media (min-width: 36rem){
  .dsc-cookiealert__body{ flex-direction: row; align-items: flex-start; justify-content: space-between; }
}

/* Text */
.dsc-cookiealert__text > :first-child{ margin-top: 0; }

/* Buttons area */
.dsc-cookiealert__form{
  display: flex;
  flex-direction: column;
  gap: var(--ds-size-2);
}

@media (min-width: 36rem){
  .dsc-cookiealert__form{ flex-direction: row; align-items: flex-start; }
}

/* Hidden confirm block */
.dsc-cookiealert__confirm[hidden]{ display: none !important; }

/* Animation */
@keyframes dsc-slide-up{
  from { transform: translateY(100%); }
  to   { transform: translateY(0%); }
}

/* ===== Modal (dialog) ===== */

.dsc-dialog{
  color: var(--ds-color-neutral-text-default);
  background: var(--ds-color-neutral-surface-default);
  border: var(--ds-border-width-default) solid var(--ds-color-neutral-border-subtle);
  border-radius: var(--ds-border-radius-lg);
  padding: var(--ds-size-4);
  max-width: 42.5rem;
  width: min(90vw, 42.5rem);
  box-shadow: var(--ds-shadow-xl);
}

.dsc-dialog::backdrop{
  /* Fallback + tokenized */
  background: rgba(32,46,69,.35);
  background: color-mix(in srgb, var(--ds-color-brand4-background-default) 35%, transparent);
}

/* Rows */
.dsc-row{
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--ds-size-3);
  padding: var(--ds-size-2) 0;
  border-bottom: var(--ds-border-width-default) solid var(--ds-color-neutral-border-subtle);
}


/* Labels & descriptions */
.dsc-row__meta{
  display:flex; flex-direction:column; gap: var(--ds-size-1); max-width: 75%;
}
`;
  document.head.appendChild(style);
}

function capitalize<K extends string>(k: K): string {
  return k.charAt(0).toUpperCase() + k.slice(1);
}

function fallbackCommon(strings: Translations) {
  return {
    acceptAll: strings.common?.acceptAll ?? "Allow all cookies",
    rejectAll: strings.common?.rejectAll ?? "Allow only necessary",
    customize: strings.common?.customize ?? "Customize",
    save: strings.common?.save ?? "Save",
  };
}

function fallbackBanner(strings: Translations) {
  return {
    title: strings.cookieBanner?.title ?? "Cookies on this site",
    description:
      strings.cookieBanner?.description ??
      "We use cookies to improve your experience. You can accept all cookies or adjust your preferences.",
  };
}

function fallbackDialog(strings: Translations) {
  return {
    title: strings.consentManagerDialog?.title ?? "Cookie settings",
    description:
      strings.consentManagerDialog?.description ??
      "Choose which categories of cookies you want to allow. Necessary cookies are always on.",
  };
}


export function createBanner(strings: Translations) {
  const common = fallbackCommon(strings);
  const banner = fallbackBanner(strings);

  const root = document.createElement("div");
  root.className = "dsc-cookiealert";
  root.setAttribute("role", "region");
  root.setAttribute("aria-label", banner.title);

  root.innerHTML = `
    <div class="dsc-cookiealert__inner">
      <div class="dsc-cookiealert__body">
        <div class="dsc-cookiealert__text">
          ${banner.title ? `<h3 class="ds-heading">${banner.title}</h3>` : ""}
          ${banner.description ? `<p class="ds-paragraph">${banner.description}</p>` : ""}
        </div>
        <form class="dsc-cookiealert__form" method="dialog">
          <button type="button" class="ds-button no-twp" data-variant="primary" data-action="accept">
            ${common.acceptAll}
          </button>
          <button type="button" class="ds-button no-twp" data-action="reject">
            ${common.rejectAll}
          </button>
          <button type="button" class="ds-button no-twp" data-action="customize">
            ${common.customize}
          </button>
        </form>
      </div>
    </div>
		`;
  return root;
}



export function createModal(categories: AllConsentNames[], strings: Translations) {
  const common = fallbackCommon(strings);
  const dialog = fallbackDialog(strings);

  const modal = document.createElement("dialog");
  modal.className = "ds-dialog no-twp";
	modal.setAttribute("data-modal", "true");
  modal.innerHTML = `
		<form method="dialog">
			<button
				class="ds-button"
				data-icon="true"
				data-variant="tertiary"
				type="submit"
				aria-label="Stäng dialogruta"
				data-color="neutral"
				name="close"
			></button>
		</form>
		<h2 class="ds-heading" style="margin-bottom: var(--ds-size-2);">
		${dialog.title}
		</h2>
		<p class="ds-paragraph" data-variant="default" data-size="sm">
			${dialog.description}
		</p>
		<div class="c15t-rows"></div>
		<div style="text-align:right; margin-top:.75rem">
			<button class="ds-button no-twp" data-action="save">${common.save}</button>
		</div>
  `;

  const rows = modal.querySelector(".c15t-rows")!;
  for (const cat of categories) {
    // if (cat === "necessary") continue; // always on
    const t = strings.consentTypes?.[cat];
    const title = t?.title ?? capitalize(cat);
    const desc = t?.description ?? "";
    const row = document.createElement("div");
    row.className = "c15t-row";
    row.innerHTML = `
	<div class="ds-field no-twp" data-position="end">
    <input
      class="ds-input no-twp"
      role="switch"
      type="checkbox"
      value="alt1"
			${cat === "necessary" ? `readonly="" checked` : ''}
      id="switch-${cat}"
      aria-describedby="switch-${cat}:description"
    />
		<label class="ds-label" data-weight="regular" for="switch-${cat}">
			${title}
		</label>
			${desc ? `
				<div data-field="description" id="switch-${cat}:description">
					${desc}
				</div>
			` : ""}
  </div>
    `;
    rows.appendChild(row);
  }
  return modal;
}

export function readToggles(modal: HTMLElement, categories: AllConsentNames[]) {
  const prefs: Record<AllConsentNames, boolean> = {
    necessary: true,
    experience: false,
    functionality: false,
    marketing: false,
    measurement: false,
  };

  for (const cat of categories) {
    const el = modal.querySelector<HTMLInputElement>(`#switch-${cat}`);
    prefs[cat] = cat === "necessary" ? true : !!el?.checked;
  }
  return prefs;
}
