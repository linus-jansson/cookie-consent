import {
	type AllConsentNames,
	configureConsentManager,
	createConsentManagerStore,
} from "c15t";
import type { HasCondition } from "c15t/dist/libs/has";
import {
	createBanner,
	createModal,
	injectStyles,
	readToggles,
	wireModal,
} from "./banner";
import { CONSENT_CATEGORIES, consentManagerConfig, consentStoreConfig } from "./config";
import { getTranslationFromLanguage } from "./helper";
import { allowConsentedScripts } from "./gate";

const handlers: Array<(p: any) => void> = [];

declare global {
	interface Window {
		consentContext: {
			has: (cat: HasCondition<AllConsentNames>) => boolean;
			onChange: (cb: (p: any) => void) => void;
			openPreferences: () => void;
			consents: {
				allowAnalytics: () => boolean;
			};
		};
	}
}

/*
export const cm = configureConsentManager({
		mode: 'offline',
		store: {
				initialGdprTypes: ['necessary', 'marketing'],
		},
});

const store = createConsentManagerStore(cm);

store.getState().has('measurement');
store.getState().setConsent('measurement', true);
store.getState().locationInfo?.jurisdiction;
*/

let uglyhas;

export async function init() {
	const consentManager = configureConsentManager(consentManagerConfig);
	const consentBanner = await consentManager.showConsentBanner();
	console.log("consent banner should be shown?", consentBanner);
	const consentStore = createConsentManagerStore(consentManager, consentStoreConfig);
	// consentStore.setState({
	// 	locationInfo: {
	// 		countryCode: "sv",
	// 		jurisdiction: "gdpr",
	// 		regionCode: null,
	// 		jurisdictionMessage: "eu",
	// 	},
	// });

	const langState = consentStore.getState().translationConfig.translations;
	const lang = getTranslationFromLanguage(langState, navigator.languages);

	uglyhas = consentStore.getState().has;

	const banner = createBanner(lang as any);
	const modal = createModal(CONSENT_CATEGORIES, lang as any);
	
	console.log("Translations from state:", lang);
	console.log("Get state to debug its contents", consentStore.getState());

	const shouldShowBanner = consentStore.getState().showPopup;
	console.log("should show banner", shouldShowBanner)
	if (shouldShowBanner) {
		injectStyles();
		wireModal(modal);
		document.body.append(modal, banner);

		banner.addEventListener("click", (e) => {
			const t = (e.target as HTMLElement).dataset.action;
			if (t === "accept" || t === "reject") {
				for (const c of CONSENT_CATEGORIES) {
					const acceptedCategory = t === "accept";
					consentStore.getState().setConsent(c, acceptedCategory);
				}
				console.log(
					"on click, current consents",
					consentStore.getState().consents,
				);
				banner.remove();
			}
			if (t === "customize") modal.setAttribute("open", "");
		});

		modal.addEventListener("click", (e) => {
			const t = (e.target as HTMLElement).dataset.action;
			if (t === "save") {
				const prefs = readToggles(modal, CONSENT_CATEGORIES);
				console.log("read toggles", prefs);
				for (const pref of prefs) {
					console.log("set consent", pref, prefs[pref]);
					consentStore.getState().setConsent(pref, prefs[pref]);
				}
				modal.removeAttribute("open");
				banner.remove();
			}
		});
	}

	const context = {
		has: (cat: HasCondition<AllConsentNames>) =>
			consentStore.getState().has(cat),
		onChange: (cb: (p: any) => void) => {
			handlers.push(cb);
		},
		openPreferences: () => modal.setAttribute("open", ""),
		consents: {
			allowAnalytics: () => consentStore.getState().has("measurement"),
		},
	};
	window.consentContext = context;
	allowConsentedScripts(consentStore.getState().has);

	return context;
}

(async () => {
	await init();
	console.log("inited");
})();

export default {
	consents: {
		allowAnalytics: () => window.consentContext?.consents.allowAnalytics() || false,
		allowsFunctional: () => window.consentContext?.has('functionality') || false,
		has: (consentOption: string) => window.consentContext?.has(consentOption) || false,
	},
	pleaseDoNotUseThisHasFunction: uglyhas
};
