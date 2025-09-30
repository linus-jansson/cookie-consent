import type { AllConsentNames, Translations } from "c15t";

export function injectStyles() {
	if (document.getElementById("c15t-banner-styles")) return;
	const style = document.createElement("style");
	style.id = "c15t-banner-styles";
	style.textContent = `
.c15t-banner{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:1rem;background:#111;color:#fff;z-index:9999}
.c15t-actions{display:flex;gap:.5rem}
.c15t-btn{padding:.5rem 1rem;border:0;border-radius:6px;cursor:pointer}
.c15t-btn--primary{background:#fff;color:#111;font-weight:600}
.c15t-btn--ghost{background:transparent;color:#fff;border:1px solid #888}
.c15t-modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:10000}
.c15t-modal[open]{display:flex}
.c15t-dialog{background:#fff;color:#111;padding:1rem;border-radius:10px;width:90%;max-width:500px}
.c15t-row{display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid #eee}
.c15t-switch{width:40px;height:20px;background:#ccc;border-radius:10px;position:relative;cursor:pointer}
.c15t-switch[data-on="true"]{background:#111}
.c15t-switch i{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s}
.c15t-switch[data-on="true"] i{transform:translateX(20px)}
`;
	document.head.appendChild(style);
}

export function createBanner(strings: Translations) {
	const el = document.createElement("div");
	el.className = "c15t-banner";
	el.innerHTML = `
<div>
	<p>${strings.cookieBanner?.title}</p>
	<p>${strings.cookieBanner?.description}</p>
</div>
<div class="c15t-actions">
	<button class="c15t-btn c15t-btn--primary" data-action="accept">${strings.common.acceptAll}</button>
	<button class="c15t-btn c15t-btn--ghost" data-action="reject">${strings.common.rejectAll}</button>
	<button class="c15t-btn c15t-btn--ghost" data-action="customize">${strings.common.customize}</button>
</div>
`;
	return el;
}

export function createModal(
	categories: AllConsentNames[],
	strings: Translations,
) {
	const modal = document.createElement("div");
	modal.className = "c15t-modal";
	modal.innerHTML = `
<div class="c15t-dialog">
<h3>${strings.common.customize}</h3>
<div class="c15t-rows"></div>
<div style="text-align:right;margin-top:.75rem">
<button class="c15t-btn c15t-btn--primary" data-action="save">${strings.common.save}</button>
</div>
</div>
`;
	const rows = modal.querySelector(".c15t-rows")!;
	for (const cat of categories) {
		if (cat === "necessary") continue;
		const row = document.createElement("div");
		row.className = "c15t-row";
		row.innerHTML = `
<span>${(strings.consentTypes as any)[cat].title ?? cat}</span>
<button class="c15t-switch" data-cat="${cat}"><i></i></button>
`;
		rows.appendChild(row);
	}
	return modal;
}

export function readToggles(modal: HTMLElement, categories: string[]) {
	const prefs: any = { necessary: true };
	for (const cat of categories) {
		if (cat === "necessary") continue;
		const sw = modal.querySelector(`.c15t-switch[data-cat="${cat}"]`);
		prefs[cat] = sw?.getAttribute("data-on") === "true";
	}
	return prefs;
}

export function wireModal(modal: HTMLElement) {
	modal.addEventListener("click", (e) => {
		const target = (e.target as HTMLElement).closest(".c15t-switch");
		if (target) {
			const on = target.getAttribute("data-on") === "true";
			target.setAttribute("data-on", (!on).toString());
		}
	});
}
