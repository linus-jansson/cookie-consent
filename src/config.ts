import type {
	AllConsentNames,
	ConsentManagerOptions,
	StoreOptions,
} from "c15t";
import { translationConfig } from "./i18n";

export const CONSENT_CATEGORIES: AllConsentNames[] = [
	"necessary",
	"functionality",
	"measurement",
];

export const consentManagerConfig: ConsentManagerOptions = {
	mode: "offline",
	store: {
		initialGdprTypes: CONSENT_CATEGORIES,
		callbacks: {
			onBannerFetched(response) {
				console.log("Consent banner fetched", response);
			},
			onConsentSet(response) {
				console.log("Consent has been saved", response);
			},
			onError(error) {
				console.log("Error", error);
			},
		},
	},
};

export const consentStoreConfig: StoreOptions = {
	initialTranslationConfig: translationConfig,
};
