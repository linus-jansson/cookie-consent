export function allowConsentedScripts(has: (a: any) => boolean) {
	const blockedScripts = document.querySelectorAll<HTMLScriptElement>(
		"script[data-consent]",
	);
	console.log("Consentable scripts");
	blockedScripts.forEach((script) => {
		const consentCategory = script.dataset.consent;

		if (!consentCategory || !has(consentCategory)) {
			return;
		}

		const newScript = document.createElement("script");

		// Copy all attributes except `type`
		Array.from(script.attributes).forEach((attr) => {
			if (attr.name === "type") return;

			// Restore original script type if specified
			if (attr.name === "data-orig-type") {
				newScript.setAttribute("type", attr.value);
			} else if (!attr.name.startsWith("data-")) {
				newScript.setAttribute(attr.name, attr.value);
			}
		});

		const dataSrc = script.getAttribute("data-src");

		if (dataSrc) {
			newScript.src = dataSrc;
		} else {
			newScript.textContent = script.textContent;
		}

		// Replace the original script
		script.replaceWith(newScript);
	});
}
