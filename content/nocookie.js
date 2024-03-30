/**
 * Close the cookies/tracking/personalization permission dialog rejecting all
 * non-essential cookies and objecting to all legitimate uses.
 *
 * @title ⛔🍪⛔
 */
(function nocookie() {
	'use strict';

	/* Did we find any known element to click? */
	let hasFoundSomethingToClick = false;

	/* Keep track of out-of-origin IFRAMEs that this bookmarklet cannot access
	 * but are likely to contain an external consent manager. */
	const externalConsentManagerIframeSelectors = [
		/* TrustArc Cookie Consent Manager <https://trustarc.com/cookie-consent-manager/> */
		'iframe[src*=".trustarc.com/"]',

		/* IAB (Interactive Advertising Bureau) CMP */
		'iframe[src*=".consensu.org/"]',

		/* LiveRamp CMP <https://liveramp.com/our-platform/preference-consent-management/privacy-manager/> */
		'iframe[src*=".privacymanager.io/"]',

		/* Generic `cmp` subdomain.
		 *
		 * E.g. https://cmp.dpgmedia.be/
		 */
		'iframe[src^="https://cmp."]',

		/* Sourcepoint CMP <https://www.sourcepoint.com/cmp/>
		 *
		 * E.g. https://www.theguardian.com/
		 * E.g. https://www.bloomberg.com/
		 */
		'iframe[src*=".privacy-mgmt.com/"]',
		'iframe[src^="https://sourcepoint.theguardian.com/"]',
		'iframe[src^="https://sourcepointcmp."]',
		'iframe[src^="https://"][src*="/index.html?"][src*="consentUUID"]',

		/* The Telegraph
		 *
		 * E.g. https://www.telegraph.co.uk/
		 */
		'iframe[src^="https://tcf2.telegraph.co.uk/"]',

		/* “No Jazz”, whatever that may be. Used by Van Dale, possibly
		 * others. <https://nojazz.eu/nl/zaynabstestcmp/consentui>
		 *
		 * E.g. https://www.vandale.nl/
		 */
		'iframe[src^="https://nojazz.eu/"]',
	];
	const probableExternalConsentManagerIframeUris = [];
	const probableExternalConsentManagerIframes = [];

	/* Get the top document and all of its sub-documents, recursively. */
	function getAllDocuments(currDocument) {
		if (!getAllDocuments.cache) {
			getAllDocuments.cache = new WeakMap();
		}

		if (!currDocument) {
			currDocument = document;
		}

		if (getAllDocuments.cache.get(currDocument)) {
			return getAllDocuments.cache.get(currDocument);
		}

		const documents = [currDocument];

		/* Recurse for (i)frames. */
		currDocument.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]').forEach(elem => {
			if (elem.contentDocument) {
				documents.push(...getAllDocuments(elem.contentDocument));
			}
		});

		getAllDocuments.cache.set(currDocument, documents);

		return documents;
	}

	/**
	 * Call querySelector on the given roots. By default, it searches the top
	 * document and its sub-documents, ignoring the shadow roots. It returns
	 * the first match it finds.
	 *
	 * When you tell it to recurse into shadow roots, the first match might
	 * not be the first node in document order: it first looks at the regular
	 * DOM, and only when it does not find a match does it recurse into the
	 * shadow roots.
	 *
	 * Properties of the options object:
	 * - `roots`: HTMLElement(s), one element or an array of elements to use
	 *   as the root for the search, i.e. where `querySelector` will be
	 *   called.
	 * - `maxShadowRootDepth`: int, the maximum level of shadow roots to search
	 *   (e.g.`1` means search shadow roots directly inside the document, but
	 *   not inside another shadow root. `2` means search shadow roots within
	 *   the first-level shadow roots too, etc.)
	 */
	function deepQuerySelector(selector, options) {
		let {roots, maxShadowRootDepth} = options || {};

		if (!roots) {
			roots = getAllDocuments();
		} else if (!Array.isArray(roots)) {
			roots = [roots];
		}

		if (Number.isNaN(maxShadowRootDepth)) {
			maxShadowRootDepth = 0;
		}

		for (let i = 0; i < roots.length; i++) {
			const normalQuerySelectorResult = roots[i].querySelector(selector);
			if (normalQuerySelectorResult) {
				return normalQuerySelectorResult;
			}

			/* If we got here, there were no matches in the current DOM (which can be a shadow DOM already). Recurse into the nested shadow DOM, if any. */
			if (maxShadowRootDepth > 0) {
				const shadowRoots = getShadowRoots(roots[i]);
				if (shadowRoots.length) {
					const deepQuerySelectorResult = deepQuerySelector(selector, {
						roots: shadowRoots,
						maxShadowRootDepth: maxShadowRootDepth - 1
					});

					if (deepQuerySelectorResult) {
						return deepQuerySelectorResult;
					}
				}
			}
		}
	}

	/**
	 * Call querySelectorAll on the top document and its sub-documents.
	 *
	 * Contrary to `deepQuerySelector`, this does not support recursing into
	 * shadow roots, because that can get real expensive real quick.
	 * */
	function deepQuerySelectorAll(selector) {
		let allElements = [];

		const allDocuments = getAllDocuments();
		for (let i = 0; i < allDocuments.length; i++) {
			allElements = allElements.concat(Array.from(allDocuments[i].querySelectorAll(selector)));
		}

		return allElements;
	}

	/* Shadow roots can only be attached to a subset of *regular* HTML
	 * elements, but also to all *custom* elements. Because the latter can
	 * have pretty much any name, we need to negate the list of known regular
	 * elements that cannot be shadow hosts.
	 * See https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#elements_you_can_attach_a_shadow_to
	 * */
	const regularElementsThatCannotBeShadowHostsSelector = 'a,abbr,address,area,audio,b,base,bdi,bdo,br,button,canvas,caption,cite,code,col,colgroup,data,datalist,dd,del,details,dfn,dialog,dl,dt,em,embed,fieldset,figcaption,figure,form,head,hgroup,hr,html,i,iframe,img,input,ins,kbd,label,legend,li,link,map,mark,math,math *,menu,meta,meter,noscript,object,ol,optgroup,option,output,param,picture,pre,progress,q,rp,rt,ruby,s,samp,script,select,slot,small,source,strong,style,sub,summary,sup,svg,svg *,table,tbody,td,template,textarea,tfoot,th,thead,time,title,tr,track,u,ul,var,video,wbr';
	const possibleShadowHostsSelector = regularElementsThatCannotBeShadowHostsSelector
			.split(',')
			.map(s => `:not(${s})`)
			.join('');

	/*
	 * Get all shadow roots inside the given starting root(s), which can be
	 * documents, elements, or shadow roots.
	 *
	 * This function does not recurse into the found shadow roots.
	 *
	 * If no starting root is given, the document and its sub-documents
	 * (IFRAMEs, etc.) will be used.
	 */
	function getShadowRoots(roots) {
		if (!roots) {
			roots = getAllDocuments();
		} else if (roots.length) {
			roots = Array.from(roots);
		} else if (!Array.isArray(roots)) {
			roots = [roots];
		}

		const shadowRoots = [];
		roots.forEach(root => shadowRoots.push(...
			Array.from(root.querySelectorAll(possibleShadowHostsSelector))
				.filter(possibleShadowHost => possibleShadowHost.shadowRoot)
				.map(shadowHost => shadowHost.shadowRoot)
		));

		return shadowRoots;
	}

	/**
	 * If there is a match for `selectorOrElement`, click the corresponding
	 * element and wait a bit before executing the callback, e.g. to allow for
	 * a cookie dialog to be opened.
	 *
	 * If there is no matching element, execute the callback immediately.
	 */
	function clickAndWaitOrDoItNow(selectorOrElement, provider, callback) {
		if (tryToClick(selectorOrElement, provider)) {
			setTimeout(callback, 250);
		} else {
			callback();
		}
	}

	/**
	 * Call the `click` function on the first element that matches the
	 * given selector. Alternatively, you can specify an element
	 * directly.
	 */
	function tryToClick(selectorOrElement, provider, deepQuerySelectorOptions) {
		const elem = typeof selectorOrElement === 'string'
			? deepQuerySelector(selectorOrElement, deepQuerySelectorOptions)
			: selectorOrElement;

		if (elem) {
			const text = elem.localName === 'input'
				? elem.value
				: elem.textContent.replaceAll('\n', ' ').trim().replace(/(.{32}).*/, '$1…');

			const msg = typeof selectorOrElement === 'string'
				? `nocookie: found ${provider} element (“${text}”) to click for selector ${selectorOrElement}: `
				: `nocookie: found ${provider} element (“${text}”) to click: `;
			console.log(msg, elem);

			/* Click after a small timeout to make sure the `console.log()`
			 * is executed before potentially unloading the page, e.g.
			 * because the `click()` submits a form. */
			setTimeout(_ => elem.click(), 50);

			hasFoundSomethingToClick = true;
			return true;
		}
	}

	/**
	 * Call the `tryToClick` function on the given selector, element, or
	 * callback. If that was not successful (i.e., no element to click
	 * was found), keep looking for a matching element until the maximum
	 * time has been exceeded.
	 */
	function retryToClick(selectorOrElement, provider, maxNumMilliseconds, deepQuerySelectorOptions) {
		if (typeof maxNumMilliseconds === 'undefined') {
			maxNumMilliseconds = 5000;
		}
		const startTimestamp = +new Date();
		const numMillisecondsBetweenTries = 100;

		const retrier = _ => {
			const currTimestamp = +new Date();

			if (tryToClick(selectorOrElement, provider, deepQuerySelectorOptions)) {
				const numMillisecondsElapsed = currTimestamp - startTimestamp;
				if (numMillisecondsElapsed >= numMillisecondsBetweenTries) {
					console.log(`nocookie: ↑ found that button to click after ${numMillisecondsElapsed} milliseconds. ↑`);
				}

				return;
			}

			if (currTimestamp + numMillisecondsBetweenTries <= startTimestamp + maxNumMilliseconds) {
				setTimeout(retrier, numMillisecondsBetweenTries);
			}
		};

		retrier();
	}

	/**
	 * Uncheck the given checkboxes or the checkboxes matching the given
	 * selector.
	 */
	function tryToUncheck(selectorOrElements) {
		const elems = typeof selectorOrElements === 'string'
			? deepQuerySelectorAll(selectorOrElements)
			: selectorOrElements;

		elems.forEach(check => {
			/* Determine the label for each checkbox to include in the log. */
			let labellingElement;
			let labelText;

			if (check.hasAttribute('aria-label')) {
				labelText = check.getAttribute('aria-label');
			} else if (check.hasAttribute('title')) {
				labelText = check.getAttribute('title');
			} else {
				if (check.hasAttribute('aria-labelledby')) {
					labellingElement = document.getElementById(check.getAttribute('aria-labelledby'));
				}

				if (!labellingElement && check.hasAttribute('id')) {
					try {
						labellingElement = document.querySelector(`label[for="${check.id}"]`);
					} catch (e) {
					}
				}

				if (!labellingElement) {
					labellingElement = check.closest('label');
				}

				if (labellingElement) {
					labelText = labellingElement.textContent.trim();
				}
			}

			if (typeof labelText === 'undefined' || labelText === '') {
				labelText = `<${check.localName}` + ['name', 'value', 'id', 'class'].map(attrName => check.hasAttribute(attrName)
					? ` ${attrName}="${check.getAttribute(attrName)}"`
					: ''
				).filter(_ => _).join('') + '>';
			}

			/* If this checkbox was toggled after clicking another checkbox
			 * (e.g. a checkbox that represents entire group), don’t trigger
			 * another click, as that would inadvertently re-check the box. */
			if (check.checked === false) {
				console.log(`nocookie: checkbox for “${labelText}” was already unchecked: `, check);
				return;
			}

			/* Some elements are not actually checkboxes but CSOs (a.ka.
			 * Checkbox-Shaped Objects™). They often have custom logic and
			 * event handlers that requires them to be clicked to uncheck
			 * them. To be on the safe side, set the `.checked` to `false`
			 * anyway, even after clicking. */
			console.log(`nocookie: unchecking checkbox for “${labelText}”: `, check);
			check.click();
			check.checked = false;
			check.setAttribute('aria-checked', 'false');
		});

	}

	/* ↙ In case you’re wondering about this brace: there used to be a
	 * ↙ recursive function here, but the logic was changed. To prevent
	 * ↙ useless source diff/blame, I simply left the indent of its original
	 * ↙ body block. */
	{
		/* -----------------------------------------------------------------
		 * Drupal’s EU Cookie Compliance (GDPR Compliance) banner <https://www.drupal.org/project/eu_cookie_compliance>
		 *
		 * E.g. https://dropsolid.com/
		 * E.g. https://www.mo.be/
		 * E.g. https://www.warmshowers.org/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('.eu-cookie-compliance-banner .decline-button, .decline-button[class*="eu-cookie-compliance"]', 'Drupal')) {
			tryToUncheck('.eu-cookie-compliance-categories input[type="checkbox"][name="cookie-categories"]:checked');
			tryToClick('.eu-cookie-compliance-banner .eu-cookie-compliance-save-preferences-button', 'Drupal');
		}

		/* -----------------------------------------------------------------
		 * TrustArc Cookie Consent Manager <https://trustarc.com/cookie-consent-manager/>
		 * (This is the in-page version, not the out-of-origin IFRAME version.)
		 *
		 * E.g. https://trustarc.com/
		 * ----------------------------------------------------------------- */
		tryToClick('#truste-consent-required', 'TrustArc');

		/* -----------------------------------------------------------------
		 * Cookie-Script <https://cookie-script.com/>
		 * ----------------------------------------------------------------- */
		tryToClick('#cookiescript_reject', 'Cookie-Script');

		/* -----------------------------------------------------------------
		 * CookieYes/Cookie-Law-Info <https://wordpress.org/plugins/cookie-law-info/>
		 * ----------------------------------------------------------------- */
		tryToClick('#cookie_action_close_header_reject, [data-cky-tag="reject-button"], .cky-btn-reject', 'CookieYes/Cookie-Law-Info');

		/* -----------------------------------------------------------------
		 * GDPR Legal Cookie App for Shopify <https://gdpr-legal-cookie.myshopify.com/>
		 *
		 * E.g. https://gdpr-legal-cookie.myshopify.com/
		 * E.g. https://www.flectr.bike/
		 * ----------------------------------------------------------------- */
		tryToClick('#essential_accept .btn-btn-save', 'GDPR Legal Cookie App for Shopify');

		/* -----------------------------------------------------------------
		 * NextEuropa cookie consent kit <https://github.com/ec-europa/nexteuropa_cookie_consent_kit>
		 *
		 * E.g. https://ec.europa.eu/
		 * E.g. https://eur-lex.europa.eu/
		 * ----------------------------------------------------------------- */
		if (tryToClick('.cck-actions-button[href="#refuse"], .wt-cck-btn-refuse', 'NextEuropa')) {
			tryToClick('.cck-actions [href="#close"]', 'NextEuropa');
		}

		/* -----------------------------------------------------------------
		 * HubSpot’s cookie banner <https://www.hubspot.com/data-privacy/gdpr>
		 *
		 * E.g. https://www.hubspot.com/
		 * E.g. https://www.mdi.lu/
		 * ----------------------------------------------------------------- */
		tryToClick('#hs-eu-decline-button', 'HubSpot');

		/* -----------------------------------------------------------------
		 * Nimbu (Zenjoy) cookie consent bar <https://www.nimbu.io/>
		 *
		 * E.g. https://www.zenjoy.be/
		 * E.g. https://www.ecopower.be/
		 * E.g. https://www.gezondheidenwetenschap.be/
		 * ----------------------------------------------------------------- */
		tryToClick('.nimbuCookie .cn-ok button:not(.cm-btn-success):not(.cm-btn-info)', 'Nimbu (Zenjoy)');

		/* -----------------------------------------------------------------
		 * Orejime, GDPR compliance for Drupal <https://www.drupal.org/project/orejime>
		 *
		 * E.g. https://financien.belgium.be/
		 * ----------------------------------------------------------------- */
		tryToClick('.orejime-Button--decline, .orejime-Notice-declineButton', 'Orejime');

		/* -----------------------------------------------------------------
		 * CookieFirst Cookie Consent <https://cookiefirst.com/cookie-consent/>
		 *
		 * E.g. https://cycling.vlaanderen/
		 * E.g. https://www.zettlerelectronics.com/
		 * E.g. https://www.nosta.de/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('.cookiefirst-root [data-cf-action="reject"]', 'CookieFirst')) {
			const lastPossibleCookieFirstButton = deepQuerySelectorAll('button[data-cookiefirst-button="secondary"]:nth-of-type(3):last-child').pop();
			if (lastPossibleCookieFirstButton) {
				tryToClick(lastPossibleCookieFirstButton, 'CookieFirst modal dialog');
			}
		}

		/* -----------------------------------------------------------------
		 * CookieFirst Cookie Consent, v2.0 <https://cookiefirst.com/cookie-consent/>
		 *
		 * E.g. https://www.boekenwereld.com/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('[data-cookiefirst-action="reject"]', 'CookieFirst')) {
			clickAndWaitOrDoItNow(
				'[data-cookiefirst-action="adjust"]',
				'CookieFirst',
				_ => {
					tryToUncheck('.cookiefirst-root [role="checkbox"][aria-checked="true"], .cookiefirst-root input[type="checkbox"]:checked');
					tryToClick('[data-cookiefirst-action="save"]', 'CookieFirst');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Google Funding Choices <https://developers.google.com/funding-choices>
		 *
		 * E.g. https://www.nme.com/
		 * E.g. https://www.foodiesmagazine.nl/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('.fc-cta-do-not-consent', 'Google Funding Choices')) {
			clickAndWaitOrDoItNow(
				'.fc-cta-manage-options',
				'Google Funding Choices',
				_ => {
					tryToUncheck('.fc-preference-legitimate-interest, input[type="checkbox"][id*="egitimate"]:checked');
					tryToClick('.fc-confirm-choices', 'Google Funding Choices');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Google’s own properties (not using their own Funding Choices…)
		 *
		 * E.g. https://www.google.com/
		 * ----------------------------------------------------------------- */
		tryToClick('[aria-modal="true"][aria-label*="Google"] button:first-child:not(:only-child):not([aria-haspopup="true"])', 'Google consent modal dialog')
			|| tryToClick('form[action^="https://consent.google."][action$="/save"] button[jsaction]', 'Google consent modal dialog (FORM version)')
			|| tryToClick('form[action^="https://consent.youtube."][action$="/save"] button[jsaction]', 'Google consent modal dialog (YouTube FORM version)');

		/* -----------------------------------------------------------------
		 * YouTube “consent bump” (yet another method for a Google property…)
		 *
		 * E.g. https://www.youtube.com/
		 * ----------------------------------------------------------------- */
		tryToClick('ytd-consent-bump-v2-lightbox ytd-button-renderer:first-of-type:not(:only-child) button', 'YouTube consent bump');

		/* -----------------------------------------------------------------
		 * Yahoo IAB cookie consent
		 *
		 * E.g. https://www.yahoo.com/
		 * E.g. https://techcrunch.com/
		 * ----------------------------------------------------------------- */
		tryToClick('#consent-page button[name="reject"]', 'Yahoo IAB');

		/* -----------------------------------------------------------------
		 * Onetrust <https://www.onetrust.com/products/cookie-consent/>
		 *
		 * E.g. https://www.onetrust.com/
		 * E.g. https://www.booking.com/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('#onetrust-reject-all-handler', 'Onetrust')) {
			clickAndWaitOrDoItNow(
				'#onetrust-pc-btn-handler',
				'Onetrust',
				_ => {
					tryToUncheck('#onetrust-consent-sdk input[type="checkbox"]:checked');
					tryToClick('.onetrust-close-btn-handler', 'Onetrust');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Didomi
		 *
		 * There are several variants:
		 * - a “Deny all” link in the opening screen of the pop-up, instantly
		 *   closing the pop-up
		 * - a “Deny all” button in the configure/more info screen next to
		 *   the “Save” button, instantly closing the pop-up
		 * - a “Deny all” button above the different types of consent, after
		 *   which the choices still need to be saved with the (sibling-less)
		 *   “Save” button.
		 *
		 * E.g. https://www.didomi.io/
		 * E.g. https://www.oui.sncf/
		 * E.g. https://www.jobat.be/ (2023-03-20: still without “Deny all”)
		 * E.g. https://www.zimmo.be/ (2023-03-20: still without “Deny all”)
		 * E.g. https://www.rtbf.be/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('#didomi-notice-disagree-button, .didomi-continue-without-agreeing', 'Didomi')) {
			clickAndWaitOrDoItNow(
				'#didomi-notice-learn-more-button',
				'Didomi',
				_ => {
					/* First try the “Deny all” button above the different types of
					 * consent. If there is none, try the “Deny all” button at the bottom
					 * of the pop-up. If there is only one button, it is not the “Deny
					 * all” button, but the “Save” button.  */
					if (!tryToClick('#didomi-radio-option-disagree-to-all', 'Didomi')) {
						/* Reject all possible cookies / object to all possible interests and personalization. */
						retryToClick('.didomi-consent-popup-actions button:first-of-type:not(:only-child)', 'Didomi');
					}

					/* Save & exit. We need to wait a bit for the new first button to become available. */
					setTimeout(_ => retryToClick('.didomi-consent-popup-actions button:first-of-type', 'Didomi'), 250);
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Quantcast
		 *
		 * E.g. https://www.quantcast.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.qc-cmp2-summary-buttons button[mode="secondary"]',
			'Quantcast',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				tryToClick('.qc-cmp2-header-links button:nth-of-type(1)', 'Quantcast (reject main cookies)');

				/* Do the same for the partners. */
				if (tryToClick('.qc-cmp2-footer-links button:nth-of-type(1)', 'Quantcast (go to partners tab)')) {
					setTimeout(_ => {
						tryToClick('.qc-cmp2-header-links button:nth-of-type(1)', 'Quantcast (reject partner cookies)');

						/* Do the same for the legitimate interests. */
						if (tryToClick('.qc-cmp2-footer-links button:nth-of-type(2)', 'Quantcast (go to legitimate interests tab)')) {
							setTimeout(_ => tryToClick('.qc-cmp2-header-links button:nth-of-type(1)', 'Quantcast (object to all interests)'), 50);
						}
					}, 50);
				}

				/* Save & exit. */
				setTimeout(_ => {
					retryToClick('.qc-cmp2-footer button[mode="primary"]', 'Quantcast (save & exit)');
				}, 500);
			}
		);

		/* -----------------------------------------------------------------
		 * Fandom/Wikia
		 *
		 * E.g. https://www.fandom.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'[data-tracking-opt-in-learn-more="true"]',
			'Fandom/Wikia',
			_ => {
				tryToUncheck('[data-tracking-opt-in-overlay="true"] input[type="checkbox"]:checked');
				retryToClick('[data-tracking-opt-in-save="true"]', 'Fandom/Wikia');
			}
		);

		/* -----------------------------------------------------------------
		 * Kunstmaan Cookie Bar <https://github.com/Kunstmaan/KunstmaanCookieBundle>
		 *
		 * E.g. https://www.meteo.be/nl/gent
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.js-kmcc-extended-modal-button[data-target="legal_cookie_preferences"]',
			'Kunstmaan Cookie Bar',
			_ => {
				tryToUncheck('.kmcc-cookies-toggle-pp input[type="checkbox"]:checked');
				tryToClick('#kmcc-accept-some-cookies', 'Kunstmaan Cookie Bar');
			}
		);

		/* -----------------------------------------------------------------
		 * Stad Gent cookie consent (a heavily modified Cybot Cookie Dialog)
		 *
		 * E.g. https://stad.gent/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'#SG-CookieConsent--TogglePreferencesButton',
			'Stad Gent',
			_ => {
				tryToUncheck('input.SG-CookieConsent--checkbox[type="checkbox"]:checked');
				tryToClick('#SG-CookieConsent--SavePreferencesButton', 'Stad Gent');
			}
		);

		/* -----------------------------------------------------------------
		 * Osano Cookie Consent <https://www.osano.com/cookieconsent>
		 *
		 * E.g. https://www.osano.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.osano-cm-denyAll, .osano-cm-button--type_denyAll', 'Osano');

		/* -----------------------------------------------------------------
		 * AdResults Cookie Script <https://adresults.nl/tools/cookie-script/>
		 *
		 * E.g. https://adresults.nl/
		 * E.g. https://www.ekoplaza.be/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'a[href="#"].cookie_tool_more, #cookie_tool_config',
			'AdResults',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				(deepQuerySelector('input[name="cookie_tool_choise"][value="3"]') ?? {}).checked = true;

				/* Save & exit. */
				tryToClick('.cookie_tool_submit', 'AdResults');
			}
		);

		/* -----------------------------------------------------------------
		 * Free Privacy Policy’s Cookie Consent <https://www.freeprivacypolicy.com/free-cookie-consent/>
		 *
		 * E.g. https://www.lehmanns.de/
		 * E.g. https://www.dronten-online.nl/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.cc_dialog button.cc_b_cp, .cc_dialog .btn:not(.cc_b_ok_custom)',
			'Free Privacy Policy',
			_ => {
				tryToUncheck('.checkbox_cookie_consent:checked');
				tryToClick('.cc_cp_f_save button', 'Free Privacy Policy');
			}
		);

		/* -----------------------------------------------------------------
		 * Iubenda Cookie Solution <https://www.iubenda.com/en/cookie-solution>
		 *
		 * E.g. https://www.iubenda.com/
		 * E.g. https://www.siracusanews.it/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('.iubenda-cs-reject-btn', 'Iubenda Cookie Solution')) {
			clickAndWaitOrDoItNow(
				'.iubenda-cs-customize-btn',
				'Iubenda',
				_ => {
					if (!tryToClick('[class*="iubenda"] .purposes-btn-reject', 'Iubenda Cookie Solution')) {
						clickAndWaitOrDoItNow(
							'#iubFooterBtnIab',
							'Iubenda',
							_ => {
								/* Reject all possible cookies / object to all possible interests and personalization. */
								tryToClick('.iub-cmp-reject-btn', 'Iubenda');

								/* Save & exit. */
								tryToClick('#iubFooterBtn, .iubenda-cs-reject-btn', 'Iubenda');
							}
						);
					}
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Ezoic CMP <https://www.ezoic.com/>
		 *
		 * E.g. https://www.ezoic.com/ (has “Reject all” button)
		 * E.g. https://www.sheldonbrown.com/ (only has “Configure” button)
		 * ----------------------------------------------------------------- */
		if (!tryToClick('#ez-accept-necessary', 'Ezoic')) {
			clickAndWaitOrDoItNow(
				'#ez-manage-settings, [onclick*="handleShowDetails"], [onclick*="handleManageSettings"]',
				'Ezoic',
				_ => {
					/* Reject all possible cookies / object to all possible interests and personalization. */
					tryToUncheck('input[type="checkbox"].ez-cmp-checkbox:checked');

					/* Do the same for all the vendors. */
					clickAndWaitOrDoItNow(
						'#ez-show-vendors, [onclick*="savePurposesAndShowVendors"]',
						'Ezoic',
						_ => {
							tryToUncheck('input[type="checkbox"].ez-cmp-checkbox:checked');
							tryToClick('#ez-save-settings, [onclick*="saveVendorsAndExitModal"], [onclick*="handleSaveSettings"]', 'Ezoic');
						}
					);

					/* Save & exit. */
					retryToClick('#ez-save-settings, [onclick*="savePurposesAndExitModal"], [onclick*="handleSaveSettings"]', 'Ezoic');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Cybot Cookie Dialog
		 *
		 * E.g. https://www.cybot.com/
		 * E.g. https://www.bridge.nl/
		 * E.g. https://www.sncf.com/
		 * E.g. https://www.velux.com/
		 * ----------------------------------------------------------------- */
		tryToClick('#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll, #CybotCookiebotDialogBodyButtonDecline, #CybotCookiebotDialogBodyLevelButtonDecline', 'Cybot');

		/* -----------------------------------------------------------------
		 * UserCentrics Consent Management Platform <https://usercentrics.com/> (with Shadow DOM)
		 *
		 * E.g. https://usercentrics.com/
		 * E.g. https://www.rosebikes.nl/
		 * E.g. https://www.immoweb.be/
		 * ----------------------------------------------------------------- */
		const userCentricsShadowRoot = deepQuerySelector('#usercentrics-root')?.shadowRoot;
		if (userCentricsShadowRoot) {
			clickAndWaitOrDoItNow(
				userCentricsShadowRoot.querySelector('button[data-testid="uc-more-button"]'),
				'UserCentrics (with Shadow DOM)',
				/* Use `setTimeout` because `retryToClick` would be useless: we
				 * cannot specify a selector string because of the shadow root,
				 * and passing the *result* of `shadowRoot.querySelector` would
				 * not get magically updated on the next try.
				 *
				 * A possible fix would be to allow specifying a (shadow) root
				 * node for `retryToClick` and `tryToClick`, but that is more work
				 * than this workaround.
				 */
				_ => setTimeout(_ => {
					tryToClick(userCentricsShadowRoot.querySelector('button[data-testid="uc-deny-all-button"]'), 'UserCentrics (with Shadow DOM)');
				}, 250)
			);
		}

		/* -----------------------------------------------------------------
		 * WordPress cookie banner (not on the main domain, but on the hosted sites)
		 *
		 * E.g. https://*.wordpress.com/
		 * E.g. https://longreads.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.cmp__notice-buttons button.is-secondary:nth-child(2)',
			'WordPress',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				retryToClick('.cmp__dialog-footer-buttons button.is-secondary:nth-child(2)', 'WordPress');
			}
		);

		/* -----------------------------------------------------------------
		 * Automattic cookie banner
		 *
		 * E.g. https://wordpress.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.a8c-cookie-banner__customize-button',
			'Automattic',
			_ => {
				tryToUncheck('.a8c-cookie-banner__options-selection input[type="checkbox"]:checked');
				tryToClick('.a8c-cookie-banner__accept-selection-button', 'Automattic');
			}
		);

		/* -----------------------------------------------------------------
		 * Pon Bike (“Pee on bike”? Triathletes, tsss…) Group cookie pop-up
		 * (Possibly a generic Magento 2 module.)
		 *
		 * E.g. https://www.union.nl/
		 * E.g. https://www.focus-bikes.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'#notice-cookie-block #btn-cookie-settings',
			'Pon Bike Group',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				/* Variety 1. */
				deepQuerySelectorAll('#cookie-manager-popup input[type="checkbox"]:checked').forEach(check => {
					/* Ugh. This appears to be some ass-backwards React “app” that
					 * keeps state based on click events instead of, y’know, looking
					 * at the actual state of an actual checkbox. */
					tryToClick(`#cookie-manager-popup label[for="${check.id}"]`, 'Pon Bike Group');
					check.checked = false;
				});

				/* Variety 2. */
				deepQuerySelectorAll('#cookie-manager-popup [data-switch="on"]').forEach(fakeCheckbox => {
					/* This is even worse than the first variety. */
					fakeCheckbox.click();
					fakeCheckbox.dataset.switch = 'off';
				});

				/* Save & exit. */
				tryToClick('#cookie-manager-popup .modal-footer button, .cookie-manager-popup .modal-footer button', 'Pon Bike Group');
			}
		);

		/* -----------------------------------------------------------------
		 * SBFX CMP <https://sfbx.io/en/produits/>
		 *
		 * E.g. https://www.meteo-grenoble.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.frame-content .button__refuseAll, .frame-content .button__skip', 'SBFX AppConsent')
			|| tryToClick('.frame-content button[aria-roledescription="link"]:only-child', 'SBFX AppConsent (brittle selector!)');

		/* -----------------------------------------------------------------
		 * Traffective Open CMP <https://traffective.com/solutions/#traffective-consent-management>
		 *
		 * E.g. https://traffective.com/
		 * E.g. https://www.mactechnews.de/
		 * E.g. https://www.fliegermagazin.de/
		 * ----------------------------------------------------------------- */
		const openCmpShadowRoot = document.querySelector('body > div.needsclick')?.shadowRoot;
		if (openCmpShadowRoot) {
			clickAndWaitOrDoItNow(
				openCmpShadowRoot.querySelector('.cmp_navi a[page="settings"]'),
				'Traffective Open CMP “Settings”',
				_ => clickAndWaitOrDoItNow(
					openCmpShadowRoot.querySelector('.cmp_level0Container .cmp_levelItem:first-child'),
					'Traffective Open CMP “Processing purposes”',
					_ => clickAndWaitOrDoItNow(
						openCmpShadowRoot.querySelector('.cmp_activateAll a:nth-child(2):last-child'),
						'Traffective Open CMP “Deactivate all”',
						_ => clickAndWaitOrDoItNow(
							openCmpShadowRoot.querySelector('.cmp_level1Container .cmp_levelItem:not(.cmp_active) > *'),
							'Traffective Open CMP “Legitimate interest”',
							_ => clickAndWaitOrDoItNow(
								openCmpShadowRoot.querySelector('.cmp_activateAll a:nth-child(2):last-child'),
								'Traffective Open CMP “Deactivate all”',
								_ => tryToClick(
									openCmpShadowRoot.querySelector('.cmp_navi .cmp_saveLink a[href="#"]:only-child'),
									'Traffective Open CMP “Confirm selection”'
								)
							)
						)
					)
				)
			);
		}

		/* -----------------------------------------------------------------
		 * Mediavine GDPR CMP
		 *
		 * E.g. https://www.thenordroom.com/
		 * E.g. https://yesmissy.com/
		 * E.g. https://www.literaryladiesguide.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'[data-name="mediavine-gdpr-cmp"] [data-view="manageSettings"]',
			'Mediavine GDPR CMP',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				tryToUncheck('[data-name="mediavine-gdpr-cmp"] input[type="checkbox"]:checked');

				/* Do the same for the partners. */
				if (tryToClick('[data-name="mediavine-gdpr-cmp"] [data-view="partnerSettings"]', 'Mediavine GDPR CMP (go to partners tab)')) {
					setTimeout(_ => tryToUncheck('[data-name="mediavine-gdpr-cmp"] input[type="checkbox"]:checked'), 250);
				}

				/* Save & exit. */
				setTimeout(_ => retryToClick('[data-name="mediavine-gdpr-cmp"] [format="secondary"]', 'Mediavine GDPR CMP (save & exit)'), 500);
			}
		);

		/* -----------------------------------------------------------------
		 * Wix cookie consent banner
		 *
		 * E.g. https://www.deparcoursbouwer.cc/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'[data-hook="consent-banner-root"] [data-hook="consent-banner-settings-button"]',
			'Wix cookie consent banner',
			_ => {
				tryToUncheck('[data-hook="consent-banner-settings-container"] input[type="checkbox"]:checked');
				tryToClick('[data-hook="consent-banner-settings-container"] [data-hook="consent-banner-settings-save-button"]', 'Wix cookie consent banner');
			}
		);

		/* -----------------------------------------------------------------
		 * NitroPay CMP <https://nitropay.com/>
		 *
		 * E.g. https://scp-wiki.wikidot.com/
		 * E.g. https://dnd5e.wikidot.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.ncmp__btn[onclick*="showModal"]',
			'NitroPay CMP',
			_ => clickAndWaitOrDoItNow(
				'.ncmp__toggle-purposes-off',
				'NitroPay CMP (reject all purposes)',
				_ => clickAndWaitOrDoItNow(
					'.ncmp__nav [onclick*="showModal"][onclick*="object"]',
					'NitroPay CMP (go to legimate interests tab)',
					_ => clickAndWaitOrDoItNow(
						'.ncmp__toggle-legint-purposes-off',
						'NitroPay CMP (object to all legitimate interests)',
						_ => retryToClick('.ncmp__btn[onclick*="hideModal"]', 'NitroPay CMP (save & exit)')
					)
				)
			)
		);

		/* -----------------------------------------------------------------
		 * Wieni cookie notice <https://www.wieni.be/>
		 * (A custom Drupal module for their customers only, it seems.)
		 *
		 * It is always the first button in the pop-up that we want to click,
		 * so it does not matter which step the pop-up is in when this code
		 * executes:
		 * - step 0: intro with “More info” button,
		 * - step 1: (functional/required cookies) and only a “Next” button,
		 * - step 2: (analytical cookies) with a “Decline” and a “Next” button,
		 * - step …: (optional other cookies) with a “Decline” and a “Next” button,
		 * - step N (thank you message) with with a “Close” button.
		 *
		 * E.g. https://www.gondola.be/
		 * E.g. https://www.the500hiddensecrets.com/
		 * E.g. https://www.joker.be/
		 * E.g. https://www.fara.be/
		 * ----------------------------------------------------------------- */
		let wieniCurrStep = 0;
		let wieniMaxSteps = 10;
		const wieniButtonSelector = '.cookie-notice .cookie-notice__footer button:first-child';
		function recursivelyClickWieniButtons() {
			if (
				tryToClick(wieniButtonSelector, `Wieni cookie notice (step ${wieniCurrStep})`)
			) {
				wieniCurrStep++;
				if (wieniCurrStep < wieniMaxSteps) {
					setTimeout(recursivelyClickWieniButtons, 125);
				}
			}
		}
		recursivelyClickWieniButtons();

		/* -----------------------------------------------------------------
		 * Google Tag Manager “UXM” (2022-02-20: I could not find *any* info on this, WTF?)
		 *
		 * E.g. https://www.vlaamsparlement.be/
		 * E.g. https://mca.be/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'[href="#uxm-settings"]',
			'Google Tag Manager UXM',
			_ => {
				tryToUncheck('input.uxm-toggle-input[type="checkbox"]:checked');
				tryToClick('#uxm-accept-custom', 'Google Tag Manager UXM');
			}
		);

		/* -----------------------------------------------------------------
		 * Complianz cookie consent <https://complianz.io/>
		 * Also available as a WordPress plugin <https://wordpress.org/plugins/complianz-gdpr/>
		 *
		 * E.g. https://www.pedaleurdeflandres.be/
		 * E.g. https://wpformation.com/
		 * E.g. https://thispointer.com/
		 * E.g. https://kasteel-rivierenhof.be/ (WordPress plugin)
		 * ----------------------------------------------------------------- */
		if (!tryToClick('.cmplz-btn.cmplz-deny', 'Complianz cookie consent deny button')) {
			tryToUncheck('.cmplz-consent-checkbox:checked');
			tryToClick('.cc-btn.cc-save-settings', 'Complianz cookie consent (save & exit)');
		}

		/* -----------------------------------------------------------------
		 * Cookie Control by CIVIC <https://www.civicuk.com/cookie-control>
		 *
		 * E.g. https://www.civicuk.com/
		 * E.g. https://www.mottmac.com/
		 * E.g. https://www.nacro.org.uk/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('#ccc-notify-reject, #ccc-reject-settings', 'Cookie Control by CIVIC')) {
			clickAndWaitOrDoItNow(
				'.ccc-notify-link, #ccc-icon:not([aria-expanded="true"])',
				'Cookie Control by CIVIC',
				_ => {
					if (!tryToClick('#ccc-notify-reject, #ccc-reject-settings', 'Cookie Control by CIVIC')) {
						tryToUncheck('#ccc-content input[type="checkbox"]:checked');
						tryToClick('#ccc-dismiss-button, #ccc-close', 'Cookie Control by CIVIC (save & exit)');
					}
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Stripe (using a separate page to manage cookies)
		 *
		 * E.g. https://www.stripe.com/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('[data-js-target="CookieSettingsNotificationRejectAll.rejectAllButton"]', 'Stripe')) {
			if (document.domain.match(/(^|\.)stripe\.com$/)) {
				const stripeManageButtonSelectors = `
					[data-js-target="CookieSettingsNotification.manageButton"],
					.db-CookieBanner a[href$="/cookie-settings"],
					.NotificationContainer a[href$="/cookie-settings"]
				`;

				clickAndWaitOrDoItNow(
					stripeManageButtonSelectors,
					'Stripe',
					_ => {
						/* The settings are saved as soon as they are changed, so just go
						 * back to the previous page. Make sure we are on the cookie settings
						 * page, though. */
						if (location.pathname.match(/\/cookie-settings$/)) {
							/* Reject all possible cookies / object to all possible interests and personalization. */
							tryToUncheck('[data-js-controller="CookieSettingsSection"] input[type="checkbox"]:checked');

							/* If the cookie preferences page was opened as a pop-up, close
							 * it. Otherwise, go back one step in the history. */
							setTimeout(
								_ => {
									if (history.length === 1) {
										if (confirm('Preferences updated. Close tab/window?')) {
											top.close();
										}
									} else {
										history.back();
									}
								},
								250
							);
						}
					}
				);
			}
		}

		/* -----------------------------------------------------------------
		 * DeepL cookie banner
		 *
		 * E.g. https://www.deepl.com/
		 * ----------------------------------------------------------------- */
		const deepLSaveSelectionButton = deepQuerySelector('.dl_cookieBanner--buttonSelected');
		if (deepLSaveSelectionButton) {
			tryToUncheck('input[type="checkbox"].dl_cookieBanner--checkbox:checked');
			tryToClick(deepLSaveSelectionButton, 'DeepL cookie banner');
		}

		/* -----------------------------------------------------------------
		 * Deutsche Bahn cookie consent dialog (with Shadow DOM)
		 *
		 * E.g. https://www.bahn.com/
		 * E.g. https://reiseauskunft.bahn.de/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('#consent-layer .js-accept-essential-cookies', 'Deutsche Bahn cookie consent dialog (with Shadow DOM)', {maxShadowRootDepth: 3})) {
			const bahnShadowRoot = deepQuerySelector('body > div:first-child')?.shadowRoot;
			if (bahnShadowRoot && !tryToClick(bahnShadowRoot.querySelector('#consent-layer .js-accept-essential-cookies'), 'Deutsche Bahn cookie consent dialog (with Shadow DOM)')) {
				clickAndWaitOrDoItNow(
					bahnShadowRoot.querySelector('#consent-layer .js-show-cookie-settings'),
					'Deutsche Bahn cookie consent dialog (with Shadow DOM)',
					_ => {
						tryToUncheck(bahnShadowRoot.querySelectorAll('#consent-layer input[type="checkbox"]:checked'));
						tryToClick(bahnShadowRoot.querySelector('#consent-layer .js-accept-selected-cookies'), 'Deutsche Bahn cookie consent dialog (with Shadow DOM) (save & exit)');
					}
				);
			}
		}

		/* -----------------------------------------------------------------
		 * Tarte Au Citron / tarteaucitron.js <https://tarteaucitron.io/>
		 *
		 * E.g. https://tarteaucitron.io/
		 * E.g. https://www.scandiberique.fr/
		 * ----------------------------------------------------------------- */
		tryToClick('.tarteaucitronDeny', 'tarteaucitron.js (“Deny all” button)');

		/* -----------------------------------------------------------------
		 * bsgdprcookies by Aleksander Woźnica <https://github.com/Aleksander98/bsgdprcookies>
		 *
		 * E.g. https://www.jqueryscript.net/demo/GDPR-Cookie-Consent-Bootstrap-4-bsgdprcookies/
		 * E.g. https://paradisio-online.be/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'#bs-gdpr-cookies-modal-advanced-btn',
			'bsgdprcookies',
			_ => {
				tryToUncheck('input[type="checkbox"][name="bsgdpr[]"]:checked');
				tryToClick('#bs-gdpr-cookies-modal-accept-btn', 'bsgdprcookies (save & exit)');
			}
		);

		/* -----------------------------------------------------------------
		 * Yonderland group cookie message
		 *
		 * E.g. https://www.asadventure.com/
		 * E.g. https://www.juttu.be/
		 * E.g. https://www.bever.nl/
		 * E.g. https://www.cotswoldoutdoor.com/
		 * E.g. https://www.runnersneed.com/
		 * E.g. https://www.snowandrock.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.as-m-popover .as-a-btn--link:last-child:not(:only-child)',
			'Yonderland group cookie message',
			_ => {
				tryToUncheck('.as-m-popover input[type="checkbox"][name="cookie-group"]:checked');
				tryToClick('.as-m-popover .as-m-group .as-a-btn', 'Yonderland group cookie message (save & exit)');
			}
		);

		/* -----------------------------------------------------------------
		 * CookieYes GDPR Cookie Consent <https://www.cookieyes.com/cookie-consent/>
		 *
		 * E.g. https://www.cookieyes.com/
		 * E.g. https://paschka.be/
		 * ----------------------------------------------------------------- */
		tryToClick('[cky-i18n="gdpr.buttons.reject.title"]', 'CookieYes GDPR Cookie Consent');

		/* -----------------------------------------------------------------
		 * Cookie Information CMP <https://cookieinformation.com/>
		 *
		 * E.g. https://cookieinformation.com/
		 * E.g. https://toogoodtogo.be/
		 * ----------------------------------------------------------------- */
		tryToClick('#cookie-information-template-wrapper #declineButton', 'Cookie Information CMP deny button');

		/* -----------------------------------------------------------------
		 * Cookie Plus WordPress plugin <https://wpcookieplus.com/>
		 *
		 * E.g. https://www.minieurope.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.cookieplus-btn-decline-cookies', 'Cookie Plus');

		/* -----------------------------------------------------------------
		 * Happy Socks cookie consent
		 *
		 * E.g. https://www.happysocks.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.cookies-consent-banner [data-test="basic-consent-required-only-btn"]',
			'Happy Socks',
			_ => {
				/* Try the newly appeared “Only required cookies” button. */
				if (!tryToClick('.cookies-consent-banner button.required-only, [name="advanced-cookie-consent"] button.required-only', 'Happy Socks')) {
					tryToUncheck('.cookies-consent-banner input[type="checkbox"]:checked, [name="advanced-cookie-consent"] input[type="checkbox"]:checked');
					tryToClick('.cookies-consent-banner button.confirm, [name="advanced-cookie-consent"] button.confirm', 'Happy Socks');
				}
			}
		);

		/* -----------------------------------------------------------------
		 * Borlabs Cookie
		 *
		 * E.g. https://borlabs.io/borlabs-cookie/
		 * E.g. https://www.buchinger-wilhelmi.com/
		 * E.g. https://www.erlebnisberg-hoherodskopf.de/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('[data-cookie-refuse]', 'Borlabs Cookie')) {
			clickAndWaitOrDoItNow(
				'[data-cookie-individual]',
				'Borlabs Cookie',
				_ => {
					tryToUncheck('[data-borlabs-cookie-switch]:checked');
					tryToClick('[data-cookie-accept]', 'Borlabs Cookie');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * KBC/Cera cookie consent, a custom SiteCore module.
		 *
		 * E.g. https://www.cera.coop/
		 * E.g. https://www.kbcancora.be/ (not kbc.be, though)
		 * E.g. https://www.brs.coop/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'[data-component-class="Dlw.ScBase.Features.CookieConsentModule.CookieConsentModal"] .cookie-settings-open',
			'KBC/Cera cookie consent',
			_ => {
				tryToUncheck('[data-component-class="Dlw.ScBase.Features.CookieConsentModule.CookieConsentModal"] input[type="checkbox"]:not([name="Consent"]):not([name="Functional"]):not([name="Analytics"]):checked');
				tryToClick('[data-component-class="Dlw.ScBase.Features.CookieConsentModule.CookieConsentModal"] .cookie-save-button', 'KBC/Cera cookie consent');
			}
		);

		/* -----------------------------------------------------------------
		 * Piwik PRO Marketing Suite <https://piwik.pro/web-analytics/>
		 *
		 * E.g. https://piwik.pro/
		 * E.g. https://www.ugent.be/
		 * E.g. https://research.ugent.be/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'#ppms_cm_open-popup, .ppms_cm_open-popup_link',
			'Piwik PRO Marketing Suite',
			_ => tryToClick('#ppms_cm_reject-all, .ppms_cm_reject-all', 'Piwik PRO Marketing Suite')
		);

		/* -----------------------------------------------------------------
		 * mynexuzhealth cookie “app” (some Schmangular thing)
		 *
		 * E.g. https://mynexuz.be/ (requires login)
		 * ----------------------------------------------------------------- */
		tryToClick('app-cookies button:not(.btn-primary)', 'mynexuzhealth');

		/* -----------------------------------------------------------------
		 * Moove GDPR Cookie Compliance <https://wordpress.org/plugins/gdpr-cookie-compliance/>
		 *
		 * E.g. https://www.mooveagency.com/wordpress/gdpr-cookie-compliance-plugin/
		 * E.g. https://www.mrisoftware.com/
		 * E.g. https://www.aptitudesoftware.com/
		 * E.g. https://www.teneo.net/
		 * E.g. https://pearlsfoodmarket.be/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('.moove-gdpr-infobar-reject-btn', 'Moove GDPR Cookie Compliance')) {
			clickAndWaitOrDoItNow(
				'.moove-gdpr-infobar-settings-btn, #moove_gdpr_save_popup_settings_button, [data-href="#moove_gdpr_cookie_modal"]',
				'Moove GDPR Cookie Compliance',
				_ => {
					tryToUncheck('input[type="checkbox"][name^="moove_gdpr"]:not(#moove_gdpr_strict_cookies):checked');
					tryToClick('.moove-gdpr-modal-save-settings', 'Moove GDPR Cookie Compliance');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Fluvius cookie dialog
		 *
		 * E.g. https://mijn-meterstanden.fluvius.be/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'#fluv-cookies-button-goto-preferences',
			'Fluvius cookie dialog',
			_ => {
				tryToUncheck('input[type="checkbox"][id^="fluv-cookies-checkbox"]:checked');
				tryToClick('#fluv-cookies-button-accept-preferences', 'Fluvius cookie dialog');
			}
		);

		/* -----------------------------------------------------------------
		 * Shopify (main site)
		 *
		 * E.g. https://www.shopify.com/
		 * ----------------------------------------------------------------- */
		tryToClick('[data-component-name="cookie-active-consent-notice"] [data-component-name="reject"]', 'Shopify');

		/* -----------------------------------------------------------------
		 * Pandectes for Shopify <https://pandectes.io/>
		 *
		 * E.g. https://pandectes.myshopify.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.cc-btn.cc-deny', 'Pandectes (one version)');
		tryToClick('.pd-cp-ui-rejectAll', 'Pandectes (another version)');

		/* -----------------------------------------------------------------
		 * Futurumshop.nl cookie dialog
		 *
		 * E.g. https://futurumshop.nl/
		 * ----------------------------------------------------------------- */
		tryToClick('.js_cookie-bar__decline', 'Futurumshop.nl');

		/* -----------------------------------------------------------------
		 * Consent Manager Provider <https://www.consentmanager.net/>
		 *
		 * This is the version without Shadow DOM.
		 *
		 * E.g. https://slashdot.org/
		 * E.g. https://www.allgemeine-zeitung.de/ (without AND with Shadow DOM)
		 * E.g. https://www.reviersport.de/
		 * E.g. https://www.deutschesee.de/
		 * E.g. https://www.auswandererforum.de/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('.cmpboxbtnno', 'Consent Manager Provider (without Shadow DOM)')) {
			clickAndWaitOrDoItNow(
				'#cmpbox .cmptxt_btn_settings',
				'Consent Manager Provider (without Shadow DOM)',
				_ => {
					tryToUncheck('#cmpbox [role="checkbox"][aria-checked="true"]');
					tryToClick('#cmpbox .cmptxt_btn_save', 'Consent Manager Provider (without Shadow DOM)');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Consent Manager Provider <https://www.consentmanager.net/>
		 *
		 * This is the version with Shadow DOM.
		 *
		 * E.g. https://www.wielerflits.nl/
		 * E.g. https://www.consentmanager.net/
		 * ----------------------------------------------------------------- */
		const cmpShadowRoot = deepQuerySelector('#cmpwrapper')?.shadowRoot;
		if (cmpShadowRoot && !tryToClick(cmpShadowRoot.querySelector('.cmpboxbtnno'), 'Consent Manager Provider (with Shadow DOM)')) {
			clickAndWaitOrDoItNow(
				cmpShadowRoot.querySelector('.cmptxt_btn_settings'),
				'Consent Manager Provider (with Shadow DOM)',
				_ => {
					tryToUncheck(cmpShadowRoot.querySelectorAll('[role="checkbox"][aria-checked="true"]'));
					tryToClick(cmpShadowRoot.querySelector('.cmptxt_btn_save'), 'Consent Manager Provider (with Shadow DOM)');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Axeptio <https://www.axeptio.eu/> (without Shadow DOM)
		 *
		 * Some sites (e.g. PrestaShop) have several steps for the
		 * configuration, like the Wieni cookie notice.
		 *
		 * E.g. https://www.prestashop.com/
		 * E.g. https://www.ulule.com/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('#axeptio_btn_dismiss', 'Axeptio (without Shadow DOM)')) {
			clickAndWaitOrDoItNow(
				'#axeptio_btn_configure',
				'Axeptio (without Shadow DOM)',
				_ => {
					let axeptioCurrStep = 0;
					let axeptioMaxSteps = 10;
					const axeptioNextButtonSelector = '#axeptio_btn_next';
					const axeptioNextButtonsClicked = new WeakMap();

					const axeptioCheckboxSelector = '#axeptio_overlay [role="checkbox"][aria-checked="true"]';
					const axeptioCheckboxHoldersClicked = new WeakMap();

					function repeatedlyClickAxeptioButtons() {
						axeptioCurrStep++;

						/* Not only does Axeptio not use standard `<input * type="checkbox"…>`
						 * checkboxes, it also does not place the click handler on those fake
						 * checkbox elements, so we need to travel through the DOM
						 * a bit. */
						const axeptioCheckboxes = deepQuerySelectorAll(axeptioCheckboxSelector);
						axeptioCheckboxes.forEach(checkbox => {
							/* We need to check again because there are *two* `[role="checkbox"]`
							 * elements for every fake “checkbox”, and clicking one toggles the
							 * other, so clicking twice effectively is a no-op. */
							if (!checkbox.matches(axeptioCheckboxSelector)) {
								return;
							}

							const axeptioCheckboxHolder = checkbox.closest('.ListSwitch__Item')?.querySelector('.ListSwitch__Vendor');

							/* More checks to avoid duplicate clicks. */
							if (!axeptioCheckboxHolder || axeptioCheckboxHoldersClicked.get(axeptioCheckboxHolder)) {
								return;
							}

							axeptioCheckboxHoldersClicked.set(axeptioCheckboxHolder, true);

							tryToClick(axeptioCheckboxHolder, `Axeptio (without Shadow DOM) (step ${axeptioCurrStep}) fake checkbox holder`);
						});

						/* Avoid duplicate clicks on the “Next” button when it is in fact the “Done”
						 * button and is still available while the dialog is sliding out of view. */
						const axeptioNextButton = deepQuerySelector(axeptioNextButtonSelector);
						if (!axeptioNextButton || axeptioNextButtonsClicked.get(axeptioNextButton)) {
							return;
						}

						if (
							tryToClick(axeptioNextButton, `Axeptio (without Shadow DOM) (step ${axeptioCurrStep})`)
						) {
							axeptioNextButtonsClicked.set(axeptioNextButton, true);

							if (axeptioCurrStep < axeptioMaxSteps) {
								setTimeout(repeatedlyClickAxeptioButtons, 125);
							}
						}
					}
					repeatedlyClickAxeptioButtons();
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Axeptio <https://www.axeptio.eu/> (with Shadow DOM)
		 *
		 * E.g. https://www.axeptio.eu/
		 * ----------------------------------------------------------------- */
		const axeptioShadowRoot = deepQuerySelector('#axeptio_overlay > .needsclick')?.shadowRoot;
		if (axeptioShadowRoot) {
			if (!tryToClick(axeptioShadowRoot.querySelector('#axeptio_btn_dismiss'), 'Axeptio (with Shadow DOM)')) {
				clickAndWaitOrDoItNow(
					axeptioShadowRoot.querySelector('#axeptio_btn_configure'),
					'Axeptio (with Shadow DOM)',
					_ => {
						let axeptioCurrStep = 0;
						let axeptioMaxSteps = 10;
						const axeptioNextButtonSelector = '#axeptio_btn_next';
						const axeptioNextButtonsClicked = new WeakMap();

						const axeptioCheckboxSelector = '[role="checkbox"][aria-checked="true"]';
						const axeptioCheckboxHoldersClicked = new WeakMap();

						function repeatedlyClickAxeptioButtons() {
							axeptioCurrStep++;

							/* Not only does Axeptio not use standard `<input * type="checkbox"…>`
							 * checkboxes, it also does not place the click handler on those fake
							 * checkbox elements, so we need to travel through the DOM
							 * a bit. */
							const axeptioCheckboxes = axeptioShadowRoot.querySelectorAll(axeptioCheckboxSelector);
							axeptioCheckboxes.forEach(checkbox => {
								/* We need to check again because there are *two* `[role="checkbox"]`
								 * elements for every fake “checkbox”, and clicking one toggles the
								 * other, so clicking twice effectively is a no-op. */
								if (!checkbox.matches(axeptioCheckboxSelector)) {
									return;
								}

								const axeptioCheckboxHolder = checkbox.closest('.ListSwitch__Item')?.querySelector('.ListSwitch__Vendor');

								/* More checks to avoid duplicate clicks. */
								if (!axeptioCheckboxHolder || axeptioCheckboxHoldersClicked.get(axeptioCheckboxHolder)) {
									return;
								}

								axeptioCheckboxHoldersClicked.set(axeptioCheckboxHolder, true);

								tryToClick(axeptioCheckboxHolder, `Axeptio (step ${axeptioCurrStep}) fake checkbox holder`);
							});

							/* Avoid duplicate clicks on the “Next” button when it is in fact the “Done”
							 * button and is still available while the dialog is sliding out of view. */
							const axeptioNextButton = axeptioShadowRoot.querySelector(axeptioNextButtonSelector);
							if (!axeptioNextButton || axeptioNextButtonsClicked.get(axeptioNextButton)) {
								return;
							}

							if (
								tryToClick(axeptioNextButton, `Axeptio (step ${axeptioCurrStep})`)
							) {
								axeptioNextButtonsClicked.set(axeptioNextButton, true);

								if (axeptioCurrStep < axeptioMaxSteps) {
									setTimeout(repeatedlyClickAxeptioButtons, 125);
								}
							}
						}
						repeatedlyClickAxeptioButtons();
					}
				);
			}
		}

		/* -----------------------------------------------------------------
		 * NPO (Dutch Public Broadcasting) (without Shadow DOM)
		 *
		 * E.g. https://www.bnnvara.nl/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'[id^="ccm_"] .ccm_btn.ccm_btn--pre-step-next',
			'NPO CCM bar (without Shadow DOM)',
			_ => {
				/* We can’t use the `tryToUncheck` method, because the NPO CCM bar
				 * uses radio buttons, not checkboxes. We need to click/check the
				 * options that disallow cookies, rather than click/uncheck the
				 * options that allow them. */
				deepQuerySelectorAll('[id^="ccm_"] input[type="radio"][value="false"]:not(:checked)').forEach(radio => {
					if (radio.checked) {
						return;
					}

					const labelText = radio.getAttribute('aria-label') || `NPO CCM: ${radio.name}`;
					console.log(`nocookie: checking radio button for “${labelText}”: `, radio);
					radio.click();
					radio.checked = true;
				});

				tryToClick('[id^="ccm_"] .ccm_btn.ccm_btn--save', 'NPO CCM bar (without Shadow DOM)');
			}
		);

		/* -----------------------------------------------------------------
		 * NPO (Dutch Public Broadcasting) (with Shadow DOM)
		 *
		 * E.g. https://www.bnnvara.nl/
		 * ----------------------------------------------------------------- */
		const npoCcmShadowRoot = deepQuerySelector('#ccm_notification_host')?.shadowRoot;
		if (npoCcmShadowRoot) {
			clickAndWaitOrDoItNow(
				npoCcmShadowRoot.querySelector('[id^="ccm_"] .ccm_btn.ccm_btn--pre-step-next'),
				'NPO CCM bar (with Shadow DOM)',
				_ => {
					/* We can’t use the `tryToUncheck` method, because the NPO CCM bar
					 * uses radio buttons, not checkboxes. We need to click/check the
					 * options that disallow cookies, rather than click/uncheck the
					 * options that allow them. */
					npoCcmShadowRoot.querySelectorAll('[id^="ccm_"] input[type="radio"][value="false"]:not(:checked)').forEach(radio => {
						if (radio.checked) {
							return;
						}

						const labelText = radio.getAttribute('aria-label') || `NPO CCM: ${radio.name}`;
						console.log(`nocookie: checking radio button for “${labelText}”: `, radio);
						radio.click();
						radio.checked = true;
					});

					tryToClick(npoCcmShadowRoot.querySelector('[id^="ccm_"] .ccm_btn.ccm_btn--save'), 'NPO CCM bar (with Shadow DOM)');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Flanders government cookie consent (1)
		 *
		 * E.g. https://www.vlaanderen.be/
		 * ----------------------------------------------------------------- */
		tryToClick('.wp-pt-cookie-consent__cta.vl-button:not(#cookie-conosent-modal-accept)', 'Flanders cookie consent (1)');

		/* -----------------------------------------------------------------
		 * Flanders government cookie consent (2)
		 *
		 * E.g. https://www.vlaanderen.be/inbo/
		 * ----------------------------------------------------------------- */
		tryToClick('button.minimal-cookies', 'Flanders cookie consent (2)');

		/* -----------------------------------------------------------------
		 * Mobile Vikings cookie wall
		 *
		 * E.g. https://mobilevikings.be/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'#btn-cookie-settings',
			'Mobile Vikings cookie wall',
			_ => {
				tryToUncheck('input[type="checkbox"][name$="-cookies"]:checked');
				tryToClick('#btn-accept-custom-cookies', 'Mobile Vikings cookie wall');
			}
		);

		/* -----------------------------------------------------------------
		 * Canyon cookies modal
		 *
		 * E.g. https://www.canyon.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.js-manage-modalCookiesTrigger, a.privacyCookieSwitch',
			'Canyon cookies modal',
			_ => {
				tryToUncheck('input[type="checkbox"][class*="js-dataPrivacyCheckbox"]:checked');
				retryToClick('#js-manage-data-privacy-save-button', 'Canyon cookies modal');
			}
		);

		/* -----------------------------------------------------------------
		 * FreePrivacyPolicy.com Free Cookie Consent
		 * <https://www.freeprivacypolicy.com/free-cookie-consent/>
		 *
		 * E.g. https://www.immo-zone.be/
		 * ----------------------------------------------------------------- */
		tryToClick('.cc-nb-reject', 'FreePrivacyPolicy.com Free Cookie Consent');

		/* -----------------------------------------------------------------
		 * Out-of-origin IFRAMEs.
		 * ----------------------------------------------------------------- */
		deepQuerySelectorAll(externalConsentManagerIframeSelectors.join(',')).forEach(
			iframe => {
				probableExternalConsentManagerIframeUris.push(iframe.src);
				probableExternalConsentManagerIframes.push(iframe);
			}
		);
	}

	/* -----------------------------------------------------------------
	/* Generic “Deny all”/“Reject all” fallback when we did not find any known cookie
	 * consent buttons to click.
	 * ----------------------------------------------------------------- */
	if (!hasFoundSomethingToClick && !probableExternalConsentManagerIframes.length) {
		const denyAllTexts = [
			/* English */
			' deny ',
			' disallow ',
			' decline ',
			' refuse ',
			' reject ',
			' dismiss ',
			' necessary ',
			' essential ',
			' mandatory ',
			' required ',
			' minimal ',
			' no cookies ',
			' without cookies ',
			' without accepting ',
			' without agreeing ',
			' do not accept ',
			" don't accept ",
			' no thank',
			' no, thank',

			/* Dutch */
			' weigeren ',
			' weiger ',
			' afwijzen ',
			' verwerpen ',
			' noodzakelijk',
			' essentiële ',
			' essentieel ',
			' verplichte ',
			' vereiste ',
			' minimale ',
			' enkel ',
			' alleen ',
			' geen cookies ',
			' zonder cookies ',
			' zonder aanvaarden ',
			' zonder te aanvaarden ',
			' zonder accepteren ',
			' zonder te accepteren ',
			' niet toestaan ',
			' niet toelaten ',
			' niets toestaan ',
			' niets toelaten ',
			' nee, bedankt ',
			' nee bedankt ',
			' nee, dank',
			' nee dank',
			' niet akkoord ',

			/* French */
			' refuse',
			' rejete',
			' rejette',
			' nécessaire',
			' essentiel',
			' requis',
			' obligatoire',
			' minimum ',
			' minimal',
			' seulement ',
			' seul ',
			' pas de cookies ',
			' aucun ',
			' sans cookies ',
			' sans accepter ',
			' pas accepter ',
			' rien accepter ',
			' non merci ',
			' non, merci ',

			/* German */
			' ablehnen ',
			' lehne ',
			' notwendig',
			' erforderlich',
			' obligatorisch',
			' minimale ',
			' nur ',
			' kein cookies ',
			' ohne cookies ',
			' ohne zu akzeptieren ',
			' nicht akzeptieren ',
			' nichts akzeptieren ',
			' nein danke ',
			' nein, danke ',

			/* Italian */
			' rifiut',
			' rifiùt',
			' necessari',
			' essenziali',
			' richiesti',
			' obbligatori',
			' minimi',
			' solo ',
			' senza cookie ',
			' senza accettare ',
			' non accettare ',
			' non permettere ',
			' no, grazie ',
			' no grazie ',

			/* Spanish */
			' rechaz',
			' necesari',
			' esencial',
			' requerid',
			' obligatori',
			' mínim',
			' solo ',
			' sin cookies ',
			' sin aceptar ',
			' no aceptar ',
			' no permitir ',
			' no, gracias ',
			' no gracias ',

			/* Norwegian */
			' nekte al',
			' avvis al',
			' avslå',
			' nødvendig',
			' obligatorisk',
			' viktig',
			' minimal',
			' kun ',
			' uten informasjonskapsler ',
			' uten å godta ',
			' uten å akseptere ',
			' ikke akseptere ',
			' ikke tillate ',
			' nei takk ',
			' nei, takk ',

			/* Catalan */
			' refusar ',
			' rebutjar ',
			' necessari',
			' essencial',
			' obligatori',
			' mínim',
			' només ',
			' solament ',
			' unicament ',
			' sense galetes ',
			' sense cookies ',
			' sense acceptar ',
			' no permès ',
			' no permetre ',
			' no gràcies ',
			" no d'acord ",
		];

		const xPathButtonishExpression = [
			'local-name() = "button"',
			'local-name() = "a"',
			'@role = "button"',
			'@type = "button"',
			'@type = "submit"',
			'contains(@class, "button")',
			'contains(@class, "Button")',
			'contains(@class, "btn")',
			'contains(@class, "Btn")',
			'@onclick',
		].join(' or ');

		const xPathTextExpression = denyAllTexts
			.map(text => `contains(translate(concat(" ", ., " ", @value, " "), "ABCÇDEFGHIJKLMNÑOPQRSTUVWXYZРУСКИЙ’\t\n", "abcçdefghijklmnñopqrstuvwxyzруский'  "), "${text.toLowerCase().replaceAll('"', '\\"')}")`)
			.join(' or ');

		const xPathExpression = `//*[${xPathButtonishExpression}][${xPathTextExpression}]`;

		/**
		 * Get an array of results for the XPath expression on the given
		 * root(s).
		 *
		 * If no root is given, the document and its sub-documents will
		 * be used.
		 *
		 * This function does not recurse into shadow roots.
		 */
		function getXPathResults(xPathExpression, roots) {
			if (!roots) {
				roots = getAllDocuments();
			} else if (!Array.isArray(roots)) {
				roots = [roots];
			}

			const xPathResults = [];
			roots.forEach((root, i) => {
				const document = root.documentElement && typeof root.evaluate === 'function'
					? root
					: root.ownerDocument;
				let xPathResult = document.evaluate(xPathExpression, root, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

				for (let i = 0; i < xPathResult.snapshotLength; i++) {
					xPathResults.push(xPathResult.snapshotItem(i));
				}
			});

			return xPathResults;
		}

		const xPathResults = getXPathResults(xPathExpression);

		/* If there were no generic buttons in the regular document(s),
		 * search the first-level shadow DOMs. */
		if (!xPathResults.length) {
			getShadowRoots().forEach(
				/* No need to look through each child separately because our
				 * XPath expression starts with `//*`, which looks in all of the
				 * shadow root’s children. */
				shadowRoot => shadowRoot.childElementCount && xPathResults.push(...getXPathResults(xPathExpression, shadowRoot.children[shadowRoot.childElementCount - 1]))
			);
		}

		const cssConsentDescendantSelector =
			[
				'consent',
				'cookie',
				'gdpr',
				'privacy',
				'terms',
				'tcf',
			].map(
				text => [
					`:not(body)[class*="${text}"]`,
					`:not(body)[class*="${text}"] *`,
					`:not(body)[id*="${text}"]`,
					`:not(body)[id*="${text}"] *`,
					`form[action*="${text}"] *`
				].join(', ')
			).join(', ');

		const cookieTextRegexp = /cooki|informasjonskaps/i;

		let genericDenyButtons = [];
		for (let i = 0; i < xPathResults.length; i++) {
			const node = xPathResults[i];

			/* Check the text content of the offset parent. Because cookie bars and
			 * overlays are pretty much always positioned (e.g. with `position:
			 * fixed`), the buttons found using the XPath expression should have an
			 * offset parent.
			 *
			 * However, for elements inside a shadow DOM, it can happen that the
			 * button found using the XPath expression is offset relative to an element
			 * outside of the shadow root, so checking `offsetParent.textContent`
			 * would not include the text inside the shadow root. To get around this,
			 * check the shadow root’s text content.
			 *
			 * Similarly, the CSS descendant selector might not match on the node
			 * inside the shadow DOM, but could still match the offset parent or the
			 * shadow host (which can be the same node, too).
			 */
			let offsetParentIsOutsideOfShadowDom = node.offsetParent && !node.offsetParent.contains(node);

			let hasTextMatch = (node.offsetParent || node).textContent.match(cookieTextRegexp);
			if (!hasTextMatch && offsetParentIsOutsideOfShadowDom) {
				hasTextMatch = node.getRootNode().textContent.match(cookieTextRegexp);
			}

			let hasCssConsentDescendantMatch = node.matches(cssConsentDescendantSelector);
			if (!hasCssConsentDescendantMatch && offsetParentIsOutsideOfShadowDom) {
				hasCssConsentDescendantMatch = node.offsetParent.matches(cssConsentDescendantSelector);

				if (!hasCssConsentDescendantMatch) {
					hasCssConsentDescendantMatch = node.getRootNode()?.host?.matches(cssConsentDescendantSelector);
				}
			}

			/* It’s enough if either one of the text or CSS selectors matches,
			 * because sometimes the text is present but the CSS class names etc.
			 * are mangled/minified, and sometimes the text is not present but
			 * the CSS class names etc. make it obvious what purpose the buttons
			 * serve. */
			if (hasTextMatch || hasCssConsentDescendantMatch) {
				genericDenyButtons.push(node);
			}
		}

		/* Only consider the deepest nodes. For example:
		 * `<div class="buttons"><button>Reject</button></div>`
		 * Only keep the `button` and not the `div` even though both match
		 * the selectors. */
		genericDenyButtons = genericDenyButtons.filter(node => !genericDenyButtons.some(otherNode => node !== otherNode && node.contains(otherNode)));

		genericDenyButtons.forEach(node => {
			console.log(`nocookie: there was no known cookie dialog, but looking for generic button/link text, I did find this to click (“${node.textContent.replace(/\s+/g, ' ').trim()}”): `, node);
			node.click();
		});
	}

	/* Show out-of-origin IFRAMEs of external consent managers. First, flash
	 * their borders (well, outline). Only show the alert when the bookmarklet
	 * is run for the second time, to avoid an extra click/keypress to close
	 * the alert dialog that says it can’t close the cookie dialog. */
	const hasAlreadyGrabbedAttention = probableExternalConsentManagerIframes.some(
		iframe => iframe.classList.contains('xxxJanProbableExternalConsentManagerIframe')
	);

	if (hasAlreadyGrabbedAttention) {
		if (probableExternalConsentManagerIframeUris.length === 1) {
			alert(`There appears to be an IFRAME of an external consent manager. This bookmarklet cannot access that IFRAME, sorry.\n\nURI: ${probableExternalConsentManagerIframeUris[0]}`);
		} else if (probableExternalConsentManagerIframeUris.length > 1) {
			alert(`There appear to be ${probableExternalConsentManagerIframeUris.length} IFRAMEs of an external consent manager. This bookmarklet cannot access such IFRAME, sorry.\n\nURIs:\n* ${probableExternalConsentManagerIframeUris.join('\n\n* ')}`);
		}
	}

	const randomRgb = _ => Math.round(Math.random() * 255);

	const numKeyframes = 10;
	const outlineWidth = 6;

	let keyframesBody = '';
	for (let i = 0; i < numKeyframes; i++) {
		keyframesBody += `${Math.round(i / (numKeyframes - 1) * 100)}% {
			outline-width: ${outlineWidth}px;
			outline-style: ${i % 2 === 0 ? 'groove' : 'ridge'};
			outline-color: rgb(${randomRgb()}, ${randomRgb()}, ${randomRgb()});
		}`;
	}

	const animationName = `xxxJanAttentionGrabber${+new Date()}`;

	probableExternalConsentManagerIframes.forEach(iframe => {
		iframe.classList.add('xxxJanProbableExternalConsentManagerIframe');

		const iframeBounds = iframe.getBoundingClientRect();

		const div = iframe.parentNode.insertBefore(iframe.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'div'), iframe.nextSibling);
		div.classList.add('xxxJanProbableExternalConsentManagerAttentionGrabber');
		div.style.width = `${iframe.offsetWidth - (outlineWidth * 2)}px`;
		div.style.height = `${iframe.offsetHeight - (outlineWidth * 2)}px`;
		div.style.left = `${iframeBounds.x + outlineWidth}px`;
		div.style.top = `${iframeBounds.y + outlineWidth}px`;
		div.style.zIndex = iframe.ownerDocument?.defaultView?.getComputedStyle(iframe)?.zIndex ?? 1969 /* in the sunshine */;
		div.addEventListener('animationend', _ => div.remove());

		const style = document.createElementNS('http://www.w3.org/1999/xhtml', 'style');
		style.media = 'screen and (prefers-reduced-motion: no-preference)';
		style.textContent = `
			.xxxJanProbableExternalConsentManagerAttentionGrabber {
				position: absolute;
				background: rgba(128, 216, 255, 0.15);
				pointer-events: none;
				animation: 1s ${animationName};
			}

			@keyframes ${animationName} {
				${keyframesBody}
			}
		`;
		iframe.ownerDocument.head.appendChild(style);
	});
})();
