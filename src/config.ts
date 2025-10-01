import type {
	AllConsentNames,
	ConsentManagerOptions,
	StoreOptions,
} from "c15t";
import { allowConsentedScripts } from "./gate";
import { translationConfig } from "./i18n";
import consentContext from "./index";

export type ConsentCategory = AllConsentNames[];

export const CONSENT_CATEGORIES: AllConsentNames[] = [
	"necessary",
	"functionality",
	"measurement",
];

export const consentManagerConfig: ConsentManagerOptions = {
	mode: "offline",
	store: {
		initialGdprTypes: CONSENT_CATEGORIES,
	},
};

export const consentStoreConfig: StoreOptions = {
	initialTranslationConfig: translationConfig,
	callbacks: {
		onBannerFetched(response) {
			console.log("Consent banner fetched", response);
		},
		onConsentSet(response) {
			console.log("Consent has been saved", response);
			console.log("call allow consented scripts");
			allowConsentedScripts(consentContext.pleaseDoNotUseThisHasFunction);
		},
		onError(error) {
			console.log("Error", error);
		},
	},
};
