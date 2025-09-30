// consent-gate.ts
type ConsentCategory = string;

export type GateOptions = {
	/** Attribute that marks scripts requiring consent */
	attributeName?: string; // default: "data-consent"
	/** MIME used to neutralize blocked scripts (must be non-executable) */
	placeholderType?: string; // default: "application/blocked-consent"
	/** Start a MutationObserver to catch late-added scripts */
	observe?: boolean; // default: true
	/** Log helpful info */
	debug?: boolean; // default: false
};

export type EnableOptions = {
	/** If true, load enabled external scripts one-by-one (preserves order). */
	sequential?: boolean; // default: true
	/** Same attribute name as used during blocking. */
	attributeName?: string; // default: "data-consent"
	/** Log helpful info */
	debug?: boolean; // default: false
};

const DEFAULT_ATTR = "data-consent";
const DEFAULT_PLACEHOLDER = "application/blocked-consent";
const DATA_ORIG_TYPE = "data-orig-type";
const DATA_ORIG_SRC = "data-orig-src";
const DATA_BLOCKED = "data-consent-blocked";

let disconnectObserver: (() => void) | null = null;

function log(debug: boolean | undefined, ...args: any[]) {
	if (debug) console.info("[consent-gate]", ...args);
}

function hasRequiredConsent(script: HTMLScriptElement, granted: Set<ConsentCategory>, attrName: string): boolean {
	const required = (script.getAttribute(attrName) || "").trim();
	if (!required) return true; // no requirement
	const tokens = required.split(/\s+/).filter(Boolean);
	// Require *all* categories present; change to "some" with tokens.some if you prefer.
	return tokens.every(t => granted.has(t));
}

function copyCommonScriptAttrs(from: HTMLScriptElement, to: HTMLScriptElement) {
	// Preserve standard attributes
	const attrsToCopy = [
		"async", "defer", "crossorigin", "integrity", "referrerpolicy", "nonce", "noModule", "id",
		"fetchpriority"
	];
	for (const name of attrsToCopy) {
		if (from.hasAttribute(name)) {
			const val = from.getAttribute(name);
			if (val === "" || val === null) {
				// Boolean attrs like async/ defer may be empty string when present
				to.setAttribute(name, "");
			} else {
				to.setAttribute(name, val);
			}
		}
	}

	// Preserve arbitrary data-* attributes EXCEPT consent bookkeeping keys
	for (const { name, value } of Array.from(from.attributes)) {
		if (name.startsWith("data-")
			&& name !== DEFAULT_ATTR
			&& name !== DATA_ORIG_TYPE
			&& name !== DATA_ORIG_SRC
			&& name !== DATA_BLOCKED) {
			to.setAttribute(name, value);
		}
	}
}

function neutralizeScript(el: HTMLScriptElement, attrName: string, placeholderType: string, debug?: boolean) {
	if (el.getAttribute(DATA_BLOCKED) === "1") return; // already done

	// Save original type
	const origType = el.getAttribute("type") || "text/javascript";
	el.setAttribute(DATA_ORIG_TYPE, origType);

	// If external, prevent fetch by parking src
	if (el.src) {
		el.setAttribute(DATA_ORIG_SRC, el.src);
		el.removeAttribute("src");
	}

	// Flip to a non-executable type
	el.setAttribute("type", placeholderType);
	el.setAttribute(DATA_BLOCKED, "1");

	// Optional: mark clearly in DOM for debugging
	if (debug && !el.id) el.id = `blocked-${Math.random().toString(36).slice(2, 8)}`;
}

function findConsentingScripts(attrName: string): HTMLScriptElement[] {
	return Array.from(document.querySelectorAll(`script[${attrName}]`)) as HTMLScriptElement[];
}

/**
 * Block all scripts with `data-consent` (or custom attr) present *at call time*,
 * and optionally observe the DOM for new ones to block.
 */
export function blockConsentingScripts(opts: GateOptions = {}) {
	const attrName = opts.attributeName ?? DEFAULT_ATTR;
	const placeholderType = opts.placeholderType ?? DEFAULT_PLACEHOLDER;

	const toBlock = findConsentingScripts(attrName);
	toBlock.forEach(s => {neutralizeScript(s, attrName, placeholderType, opts.debug)});
	log(opts.debug, `Blocked ${toBlock.length} script(s) with ${attrName}.`);

	if (opts.observe ?? true) {
		// Observe added nodes and attribute changes that could slip execution in
		const mo = new MutationObserver(mutations => {
			for (const m of mutations) {
				if (m.type === "childList") {
					m.addedNodes.forEach(node => {
						if (node.nodeType === 1 && (node as Element).tagName === "SCRIPT") {
							const s = node as HTMLScriptElement;
							if (s.hasAttribute(attrName)) {
								neutralizeScript(s, attrName, placeholderType, opts.debug);
								log(opts.debug, "Blocked dynamically-added script:", s);
							}
						}
					});
				} else if (m.type === "attributes" && (m.target as Element).tagName === "SCRIPT") {
					const s = m.target as HTMLScriptElement;
					if (s.hasAttribute(attrName) && s.getAttribute(DATA_BLOCKED) !== "1") {
						neutralizeScript(s, attrName, placeholderType, opts.debug);
						log(opts.debug, "Blocked script after attribute change:", s);
					}
				}
			}
		});
		mo.observe(document.documentElement, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: [attrName]
		});
		disconnectObserver = () => mo.disconnect();
	}
}

/**
 * Re-enable scripts whose consent categories are granted.
 * Pass a Set (or array) of granted categories, e.g. new Set(['measurement','marketing'])
 */
export async function enableConsentedScripts(
	consents: Set<ConsentCategory> | ConsentCategory[],
	options: EnableOptions = {}
): Promise<void> {
	const granted = Array.isArray(consents) ? new Set(consents) : consents;
	const attrName = options.attributeName ?? DEFAULT_ATTR;

	// Collect *blocked* scripts that are eligible now
	const candidates = findConsentingScripts(attrName)
		.filter(s => s.getAttribute(DATA_BLOCKED) === "1")
		.filter(s => hasRequiredConsent(s, granted, attrName));

	if (!candidates.length) {
		if (options.debug) log(true, "No eligible scripts to enable.");
		return;
	}

	// Recreate & swap in place
	const recreate = (blocked: HTMLScriptElement): Promise<void> => new Promise<void>((resolve, reject) => {
		const newScript = document.createElement("script");
		const origType = blocked.getAttribute(DATA_ORIG_TYPE) || "text/javascript";
		newScript.type = origType;

		copyCommonScriptAttrs(blocked, newScript);

		const src = blocked.getAttribute(DATA_ORIG_SRC);
		if (src) {
			newScript.src = src;
		} else {
			// inline script
			newScript.textContent = blocked.textContent ?? "";
		}

		// Preserve the consent attribute for transparency (or remove if you prefer)
		newScript.setAttribute(attrName, blocked.getAttribute(attrName) || "");

		// Insert after the blocked node to maintain approximate order, then remove the old one
		blocked.insertAdjacentElement("afterend", newScript);
		blocked.remove();

		if (src) {
			newScript.addEventListener("load", () => resolve());
			newScript.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
			// If async not explicitly set, keep default synchronous behavior for classic scripts
			// (Modules are always async by spec.)
		} else {
			// Inline executes immediately on insertion
			resolve();
		}
	});

	if (options.sequential ?? true) {
		// Load one-by-one in DOM order
		for (const s of candidates) {
			try { await recreate(s); } catch (e) { log(options.debug, e); }
		}
	} else {
		// Fire in parallel; order not guaranteed
		await Promise.allSettled(candidates.map(recreate));
	}

	if (options.debug) log(true, `Enabled ${candidates.length} script(s).`);
}

/**
 * Optional helper to stop watching for new scripts (if you started observing).
 */
export function stopWatching() {
	if (disconnectObserver) {
		disconnectObserver();
		disconnectObserver = null;
	}
}
