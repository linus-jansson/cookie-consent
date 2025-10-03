import type { AllConsentNames, Translations } from "c15t";

export function injectStyles() {
	if (document.getElementById("cookie-consent-banner-styles")) return;
	const style = document.createElement("style");
	style.id = "cookie-consent-banner-styles";
	style.textContent = `
/* Root */
.dsc-cookiealert {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 9999;
  animation: dsc-slide-up 300ms ease-out forwards;
  will-change: transform;
  background: var(--ds-color-background-default);
  color: var(--ds-color-text-default);
  box-shadow: var(--ds-shadow-xl);
}

/* Container */
.dsc-cookiealert__inner {
  max-width: 72rem;
  margin-inline: auto;
  padding: var(--ds-size-8);
}

/* Layout */
.dsc-cookiealert__body {
  display: flex;
  flex-direction: column;
  gap: var(--ds-size-4);
}

@media (min-width: 36rem) {
  .dsc-cookiealert__body {
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
  }
}

/* Text */
.dsc-cookiealert__text > :first-child {
  margin-top: 0;
}

.dsc-cookiealert__text > * {
  margin-top: var(--ds-size-2);
}

/* Buttons area */
.dsc-cookiealert__form {
  display: flex;
  flex-direction: column;
  gap: var(--ds-size-2);
}

@media (min-width: 36rem) {
  .dsc-cookiealert__form {
    flex-direction: row;
    align-items: flex-start;
  }
}

/* Hidden confirm block */
.dsc-cookiealert__confirm[hidden] {
  display: none !important;
}

/* Animation */
@keyframes dsc-slide-up {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0%);
  }
}

/* Rows */
.dsc-rows {
	display: flex;
	flex-direction: column;
	gap: var(--ds-size-4);
}

.dsc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-size-3);
  padding: var(--ds-size-2) 0;
  border-bottom: var(--ds-border-width-default) solid var(--ds-color-neutral-border-subtle);
}

/* Labels & descriptions */
.dsc-row__meta {
  display: flex;
  flex-direction: column;
  gap: var(--ds-size-1);
  max-width: 75%;
}

.ds-dialog {
	background: var(--ds-color-surface-tinted) !important;
}
`;
	document.head.appendChild(style);
}

export function createBanner(strings: Translations) {

	const root = document.createElement("div");
	root.className = "dsc-cookiealert";
	root.setAttribute("data-color-scheme", "auto")
	root.setAttribute("data-color", "brand1");
	root.setAttribute("role", "region");
	root.setAttribute("aria-label", strings.cookieBanner.title ?? '');

	root.innerHTML = `
    <div class="dsc-cookiealert__inner container">
      <div class="dsc-cookiealert__body">
        <div class="dsc-cookiealert__text">
          ${strings.cookieBanner.title ? `<h3 class="ds-heading">${strings.cookieBanner.title}</h3>` : ""}
          ${strings.cookieBanner.description ? `<p class="ds-paragraph">${strings.cookieBanner.description}</p>` : ""}
        </div>
        <form class="dsc-cookiealert__form" method="dialog">
          <button type="button" class="ds-button no-twp" data-action="accept">
            ${strings.common.acceptAll}
          </button>
          <button type="button" class="ds-button no-twp" data-action="reject">
            ${strings.common.rejectAll}
          </button>
          <button type="button" class="ds-button no-twp" data-variant="secondary" data-action="customize">
            ${strings.common.customize}
          </button>
        </form>
      </div>
    </div>
		`;
	return root;
}



export function createModal(categories: AllConsentNames[], strings: Translations) {

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
		${strings.consentManagerDialog.title}
		</h2>
		<p class="ds-paragraph" data-variant="default" data-size="sm">
			${strings.consentManagerDialog.description}
		</p>
		<div class="dsc-rows"></div>
		<div style="text-align:right; margin-top:.75rem">
			<button class="ds-button no-twp" data-action="save">${strings.common.save}</button>
		</div>
  `;

	// biome-ignore lint/style/noNonNullAssertion: It will be there
	const rows = modal.querySelector(".dsc-rows")!;
	for (const cat of categories) {
		// Translation of category
		const t = strings.consentTypes?.[cat]; 
		const title = t?.title;
		const desc = t?.description ?? "";
		const row = document.createElement("div");
		row.className = "dsc-row";
		row.innerHTML = `
	<div class="ds-field no-twp" data-position="end">
    <input
      class="ds-input no-twp"
      role="switch"
      type="checkbox"
      value="alt1"
			${cat === "necessary" ? `disabled checked` : ''}
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
		// we force necessary to true to prevent client side manipulation of it
		prefs[cat] = cat === "necessary" ? true : !!el?.checked;
	}
	return prefs;
}
