import type {
	AllConsentNames,
	ConsentManagerOptions,
	StoreOptions,
} from "c15t";
import { translationConfig } from "./i18n";

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
	translationConfig: translationConfig,
};
