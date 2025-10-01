import type { TranslationConfig } from "c15t";

export const translationConfig: TranslationConfig = {
	translations: {
		en: {
			common: {
				acceptAll: "Accept all",
				rejectAll: "Reject all",
				customize: "Customize",
				save: "Save",
			},
			cookieBanner: {
				title: "Cookies on this site",
				description:
					"We use cookies to improve your experience, analyze traffic, and personalize content. You can choose which categories to allow.",
			},
			consentManagerDialog: {
				title: "Manage your cookie preferences",
				description:
					"Adjust your preferences for each category of cookies. Necessary cookies are always enabled as they are required for the site to function.",
			},
			consentTypes: {
				necessary: {
					title: "Strictly necessary",
					description:
						"Required for basic site functionality such as navigation and security. These cannot be disabled.",
				},
				functionality: {
					title: "Functionality",
					description:
						"Enable features that improve your experience, such as remembering preferences.",
				},
				experience: {
					title: "Experience",
					description:
						"Improve usability and personalize your experience on the site.",
				},
				measurement: {
					title: "Measurement",
					description:
						"Help us understand how our website is used with analytics and performance tracking.",
				},
				marketing: {
					title: "Marketing",
					description:
						"Allow us and our partners to show relevant ads based on your interests.",
				},
			},
		},
		sv: {
			common: {
				acceptAll: "Acceptera alla",
				rejectAll: "Avvisa alla",
				customize: "Anpassa",
				save: "Spara",
			},
			cookieBanner: {
				title: "Kakor på denna webbplats",
				description:
					"Vi använder kakor för att förbättra din upplevelse, analysera trafik och anpassa innehåll. Du kan välja vilka kategorier som ska tillåtas.",
			},
			consentManagerDialog: {
				title: "Hantera dina kakpreferenser",
				description:
					"Justera dina inställningar för varje kategori av kakor. Nödvändiga kakor är alltid aktiverade eftersom de krävs för att webbplatsen ska fungera.",
			},
			consentTypes: {
				necessary: {
					title: "Endast nödvändiga",
					description:
						"Krävs för grundläggande funktioner som navigering och säkerhet. Dessa kan inte inaktiveras.",
				},
				functionality: {
					title: "Funktionalitet",
					description:
						"Aktiverar funktioner som förbättrar din upplevelse, till exempel att komma ihåg inställningar.",
				},
				experience: {
					title: "Upplevelse",
					description:
						"Förbättrar användbarheten och personaliserar din upplevelse på webbplatsen.",
				},
				measurement: {
					title: "Statistiska",
					description:
						"Hjälper oss att förstå hur vår webbplats används genom analys och prestandamätning.",
				},
				marketing: {
					title: "Marknadsföring",
					description:
						"Tillåter oss och våra partners att visa relevanta annonser baserade på dina intressen.",
				},
			},
		},
	},
};
