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
			onBannerFetched(response) {
				console.error("Consent banner fetched", response);
			},
			onConsentSet(response) {
				console.log("Consent has been saved", response);
				console.log("call allow consented scripts");
				allowConsentedScripts(consentStore.getState().has);
			},
			onError(error) {
				console.error("Error with cookie consenting", error);
			},
		},
	})

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

	// uglyhas = consentStore.getState().has;

	const banner = createBanner(lang as any);
	const modal = createModal(CONSENT_CATEGORIES, lang as any);

	console.log("Translations from state:", lang);
	console.log("Get state to debug its contents", consentStore.getState());
	const shouldShowBanner = consentStore.getState().showPopup;
	console.log("should show banner", shouldShowBanner);
	if (shouldShowBanner) {
		injectStyles();
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
				consentStore.setState({
					consents: prefs,
				})
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
		allowAnalytics: () =>
			window.consentContext?.consents.allowAnalytics() || false,
		allowsFunctional: () =>
			window.consentContext?.has("functionality") || false,
		has: (consentOption: string) =>
			window.consentContext?.has(consentOption) || false,
	},
};
