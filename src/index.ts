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
} from "./banner";
import {
	CONSENT_CATEGORIES,
	consentManagerConfig,
	consentStoreConfig,
} from "./config";
import { allowConsentedScripts } from "./gate";
import { getTranslationFromLanguage } from "./helper";

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

export async function init() {
	const consentManager = configureConsentManager(consentManagerConfig);
	const consentStore = createConsentManagerStore(
		consentManager,
		consentStoreConfig,
	);
	if (!localStorage.getItem("privacy-consent-storage")) {
		consentStore.setState({ showPopup: true });
	}

	// Set callbacks
	consentStore.setState({
		callbacks: {
			onConsentSet() {
				allowConsentedScripts(consentStore.getState().has);
			},
			onBannerFetched(response) {
				console.error("Consent banner fetched", response);
			},
			onError(error) {
				console.error("Error with cookie consenting", error);
			},
		},
	})

	const langState = consentStore.getState().translationConfig.translations;
	console.log("Available languages", Object.keys(langState));
	const lang = getTranslationFromLanguage(langState, navigator.languages);

	// uglyhas = consentStore.getState().has;

	const banner = createBanner(lang as any);
	const modal = createModal(CONSENT_CATEGORIES, lang as any);

	const shouldShowBanner = consentStore.getState().showPopup;
	if (shouldShowBanner) {
		injectStyles();
		document.body.append(modal, banner);

		banner.addEventListener("click", (e) => {
			const action = (e.target as HTMLElement).dataset.action;
			if (action === "accept" || action === "reject") {
				for (const c of CONSENT_CATEGORIES) {
					const acceptedCategory = action === "accept";
					consentStore.getState().setConsent(c, acceptedCategory);
				}
				banner.remove();
			}
			if (action === "customize") {
				modal.setAttribute("open", "")
				banner.remove();
			};
		});

		modal.addEventListener("click", (e) => {
			const action = (e.target as HTMLElement).dataset.action;
			if (action === "save") {
				const prefs = readToggles(modal, CONSENT_CATEGORIES);
				for (const pref in prefs) {
					consentStore.getState().setConsent(pref as AllConsentNames, prefs[pref as AllConsentNames]);
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
})();

export default {
	consents: {
		allowAnalytics: () =>
			window.consentContext?.consents.allowAnalytics() || false,
		allowsFunctional: () =>
			window.consentContext?.has("functionality") || false,
	},
};
