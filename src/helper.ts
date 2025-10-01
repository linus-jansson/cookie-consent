import type { Translations } from "c15t";

export const getTranslationFromLanguage = (
	translations: Record<string, Partial<Translations>>,
	languages: readonly string[],
): Partial<Translations> => {
	// Navigator.languages is an array of language codes in order of preference
	// e.g. ['sv-SE', 'sv', 'en-US', 'en']
	// We try to find the best match in the translations object
	// Fallback to 'en' if no match is found
	for (const lang of languages) {
		if (translations[lang]) return translations[lang];
	}
	return translations.en!;
};
