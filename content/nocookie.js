/**
 * Close the cookies/tracking/personalization permission dialog rejecting all
 * non-essential cookies and objecting to all legitimate uses.
 *
 * @title ⛔🍪⛔
 */
(function nocookie() {
	'use strict';

	/* Create a new IFRAME to get a “clean” Window object, so we can use its
	 * console. Sometimes sites (e.g. Twitter) override `console.log` and even
	 * the entire console object. `delete console.log` or `delete console`
	 * does not always work, and messing with the prototype seemed more
	 * brittle than this. */
	const console = (function () {
		let iframe = document.getElementById('xxxJanConsole');
		if (!iframe) {
			iframe = document.createElementNS('http://www.w3.org/1999/xhtml', 'iframe');
			iframe.id = 'xxxJanConsole';
			iframe.style.display = 'none';

			(document.body || document.documentElement).appendChild(iframe);
		}

		return iframe && iframe.contentWindow && iframe.contentWindow.console || {
			log: function () {}
		};
	})();

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
		 * E.g. https://cmp.dpgmedia.be/
		 */
		'iframe[src^="https://cmp."]',

		/* Sourcepoint CMP <https://www.sourcepoint.com/cmp/>
		/* E.g. https://www.theguardian.com/
		 * E.g. https://www.bloomberg.com/
		 */
		'iframe[src*=".privacy-mgmt.com/"]',
		'iframe[src^="https://sourcepoint.theguardian.com/"]',
		'iframe[src^="https://sourcepointcmp."]',
		'iframe[src^="https://"][src*="/index.html?"][src*="consentUUID"]',

		/* The Telegraph
		 * E.g. https://www.telegraph.co.uk/
		 */
		'iframe[src^="https://tcf2.telegraph.co.uk/"]',
	];
	const probableExternalConsentManagerIframeUris = [];
	const probableExternalConsentManagerIframes = [];

	/* Get the top document and all of its sub-documents, recursively. */
	function getAllDocuments(currDocument) {
		if (!currDocument) {
			currDocument = document;
		}

		let documents = [currDocument];

		/* Recurse for (i)frames. */
		currDocument.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]').forEach(elem => {
			if (elem.contentDocument) {
				documents = documents.concat(getAllDocuments(elem.contentDocument))
			}
		});

		return documents;
	}

	/* Call querySelector on the top document and its sub-documents. */
	function deepQuerySelector(selector) {
		const allDocuments = getAllDocuments();
		for (let i = 0; i < allDocuments.length; i++) {
			const elem = allDocuments[i].querySelector(selector);
			if (elem) {
				return elem;
			}
		}
	}

	/* Call querySelectorAll on the top document and its sub-documents. */
	function deepQuerySelectorAll(selector) {
		let allElements = [];

		const allDocuments = getAllDocuments();
		for (let i = 0; i < allDocuments.length; i++) {
			allElements = allElements.concat(Array.from(allDocuments[i].querySelectorAll(selector)));
		}

		return allElements;
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
	function tryToClick(selectorOrElement, provider) {
		const elem = typeof selectorOrElement === 'string'
			? deepQuerySelector(selectorOrElement)
			: selectorOrElement;

		if (elem) {
			const text = elem.localName === 'input'
				? elem.value
				: elem.textContent.replaceAll('\n', ' ').trim().replace(/(.{32}).*/, '$1…');

			const msg = typeof selectorOrElement === 'string'
				? `nocookie: found ${provider} element (“${text}”) to click for selector ${selectorOrElement}: `
				: `nocookie: found ${provider} element (“${text}”) to click: `;
			console.log(msg, elem);

			elem.click();

			return true;
		}
	}

	/**
	 * Call the `tryToClick` function on the given selector, element, or
	 * callback. If that was not successful (i.e., no element to click
	 * was found), keep looking for a matching element until the maximum
	 * time has been exceeded.
	 */
	function retryToClick(selectorOrElement, provider, maxNumMilliseconds) {
		if (typeof maxNumMilliseconds === 'undefined') {
			maxNumMilliseconds = 5000;
		}
		const startTimestamp = +new Date();
		const numMillisecondsBetweenTries = 100;

		const retrier = _ => {
			const currTimestamp = +new Date();

			if (tryToClick(selectorOrElement, provider)) {
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
			const euCookieComplianceCategoryCheckboxes = deepQuerySelectorAll('.eu-cookie-compliance-categories input[type="checkbox"][name="cookie-categories"]');
			if (euCookieComplianceCategoryCheckboxes.length) {
				euCookieComplianceCategoryCheckboxes.forEach(check => check.checked = false);
				tryToClick('.eu-cookie-compliance-banner .eu-cookie-compliance-save-preferences-button', 'Drupal');
			}
		}

		/* -----------------------------------------------------------------
		 * TrustArc Cookie Consent Manager <https://trustarc.com/cookie-consent-manager/>
		 * (This is the in-page version, not the out-of-origin IFRAME version.)
		 * E.g. https://trustarc.com/
		 * ----------------------------------------------------------------- */
		tryToClick('#truste-consent-required', 'TrustArc');

		/* -----------------------------------------------------------------
		 * Bol.com cookie dialog
		 * E.g. https://www.bol.com/
		 * ----------------------------------------------------------------- */
		tryToClick('button[data-test="consent-modal-decline-btn"].js-decline-button', 'Bol.com');

		/* -----------------------------------------------------------------
		 * Cookie-Script <https://cookie-script.com/>
		 * ----------------------------------------------------------------- */
		tryToClick('#cookiescript_reject', 'Cookie-Script');

		/* -----------------------------------------------------------------
		 * CookieYes/Cookie-Law-Info <https://wordpress.org/plugins/cookie-law-info/>
		 * ----------------------------------------------------------------- */
		tryToClick('#cookie_action_close_header_reject', 'CookieYes/Cookie-Law-Info');

		/* -----------------------------------------------------------------
		 * PayPal.com cookie dialog
		 * E.g. https://www.paypal.com/
		 * ----------------------------------------------------------------- */
		tryToClick('#gdprCookieBanner #bannerDeclineButton', 'PayPal');

		/* -----------------------------------------------------------------
		 * CookieCuttr jQuery/WordPress plug-in <http://cookiecuttr.com/>
		 * E.g. http://cookiecuttr.com/
		 * E.g. https://www.findcrowdfunding.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.cc-cookies .cc_cookie_decline, .cc-cookies .cc-cookie-decline', 'CookieCuttr');

		/* -----------------------------------------------------------------
		 * GDPR Legal Cookie App for Shopify <https://gdpr-legal-cookie.myshopify.com/>
		 * E.g. https://gdpr-legal-cookie.myshopify.com/
		 * E.g. https://www.flectr.bike/
		 * ----------------------------------------------------------------- */
		tryToClick('#essential_accept .btn-btn-save', 'GDPR Legal Cookie App for Shopify');

		/* -----------------------------------------------------------------
		 * NextEuropa cookie consent kit <https://github.com/ec-europa/nexteuropa_cookie_consent_kit>
		 * E.g. https://ec.europa.eu/
		 * ----------------------------------------------------------------- */
		if (tryToClick('.cck-actions-button[href="#refuse"]', 'NextEuropa')) {
			tryToClick('.cck-actions [href="#close"]', 'NextEuropa');
		}

		/* -----------------------------------------------------------------
		 * Toerisme Oost-Vlaanderen’s cookie banner
		 * E.g. https://www.routen.be/
		 * ----------------------------------------------------------------- */
		tryToClick('.cookie--accept-necessary, .js--cookie--accept-necessary', 'Toerisme Oost-Vlaanderen');

		/* -----------------------------------------------------------------
		 * HubSpot’s cookie banner <https://www.hubspot.com/data-privacy/gdpr>
		 * E.g. https://www.hubspot.com/
		 * E.g. https://www.mdi.lu/
		 * ----------------------------------------------------------------- */
		tryToClick('#hs-eu-decline-button', 'HubSpot');

		/* -----------------------------------------------------------------
		 * E.g. https://www.newscientist.nl/
		 * ----------------------------------------------------------------- */
		tryToClick('.cc-compliance .cc-dismiss', 'NewScientist.nl');

		/* -----------------------------------------------------------------
		 * Nimbu (Zenjoy) cookie consent bar <https://www.nimbu.io/>
		 * E.g. https://www.zenjoy.be/
		 * E.g. https://www.ecopower.be/
		 * E.g. https://www.gezondheidenwetenschap.be/
		 * ----------------------------------------------------------------- */
		tryToClick('.nimbuCookie .cn-ok button:not(.cm-btn-success):not(.cm-btn-info)', 'Nimbu (Zenjoy)');

		/* -----------------------------------------------------------------
		 * Orejime, GDPR compliance for Drupal <https://www.drupal.org/project/orejime>
		 * E.g. https://financien.belgium.be/
		 * ----------------------------------------------------------------- */
		tryToClick('.orejime-Button--decline, .orejime-Notice-declineButton', 'Orejime');

		/* -----------------------------------------------------------------
		 * CookieFirst Cookie Consent <https://cookiefirst.com/cookie-consent/>
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
		 * Google Funding Choices <https://developers.google.com/funding-choices>
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.fc-cta-manage-options',
			'Google Funding Choices',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('.fc-preference-legitimate-interest, input[type="checkbox"][id*="egitimate"]').forEach(
					check => check.checked = false
				);

				/* Save & exit. */
				tryToClick('.fc-confirm-choices', 'Google Funding Choices');
			}
		);

		/* -----------------------------------------------------------------
		 * Google’s own properties (not using their own Funding Choices…)
		 * E.g. https://www.google.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'[aria-modal="true"][title*="Google"] button:first-child:not(:only-child):not([aria-haspopup="true"]), '
				+ 'a.ytd-button-renderer[href^="https://consent.youtube.com/"]',
			'Google',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('c-wiz div[jsaction]:first-child:not(:only-child) button').forEach(
					button => button.click()
				);

				/* Save & exit. */
				tryToClick('c-wiz form[jsaction^="submit:"] button', 'Google');
			}
		);

		/* -----------------------------------------------------------------
		 * Yahoo IAB cookie consent
		 * E.g. https://www.yahoo.com/
		 * E.g. https://techcrunch.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'#consent-page .manage-settings',
			'Yahoo IAB',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				const iabCookieComplianceCategoryCheckboxes = deepQuerySelectorAll('input[type="checkbox"][data-toggle-type="legit"], input[type="checkbox"][data-toggle-type="consent"]');
				iabCookieComplianceCategoryCheckboxes.forEach(
					check => check.checked = false
				);

				/* Save & exit. */
				if (iabCookieComplianceCategoryCheckboxes.length) {
					tryToClick('#consent-page button[name="agree"]', 'Yahoo IAB');
				}
			}
		);

		/* -----------------------------------------------------------------
		 * Onetrust <https://www.onetrust.com/products/cookie-consent/>
		 * E.g. https://www.onetrust.com/
		 * E.g. https://www.booking.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'#onetrust-pc-btn-handler',
			'Onetrust',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('#onetrust-consent-sdk input[type="checkbox"]').forEach(
					check => check.checked = false
				);

				/* Save & exit. */
				tryToClick('.onetrust-close-btn-handler', 'Onetrust');
			}
		);

		/* -----------------------------------------------------------------
		 * Didomi
		 * E.g. https://www.didomi.io/
		 * E.g. https://www.oui.sncf/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'#didomi-notice-learn-more-button',
			'Didomi',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				retryToClick('.didomi-consent-popup-actions button:first-of-type', 'Didomi');

				/* Save & exit. We need to wait a bit for the new first button to become available. */
				setTimeout(_ => retryToClick('.didomi-consent-popup-actions button:first-of-type', 'Didomi'), 250);
			}
		);

		/* -----------------------------------------------------------------
		 * Quantcast
		 * E.g. https://road.cc/
		 * E.g. https://www.bikeradar.com/
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
		 * E.g. https://www.fandom.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'[data-tracking-opt-in-learn-more="true"]',
			'Fandom/Wikia',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('[data-tracking-opt-in-overlay="true"] input[type="checkbox"]').forEach(check => check.checked = false);

				/* Save & exit. */
				retryToClick('[data-tracking-opt-in-save="true"]', 'Fandom/Wikia');
			}
		);

		/* -----------------------------------------------------------------
		 * Coolblue cookie dialog
		 * E.g. https://www.coolblue.nl/
		 * E.g. https://www.coolblue.be/
		 * ----------------------------------------------------------------- */
		tryToClick('.cookie button[name="decline_cookie"]', 'Coolblue');

		/* -----------------------------------------------------------------
		 * Kunstmaan Cookie Bar <https://github.com/Kunstmaan/KunstmaanCookieBundle>
		 * E.g. https://www.meteo.be/nl/gent
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.js-kmcc-extended-modal-button[data-target="legal_cookie_preferences"]',
			'Kunstmaan Cookie Bar',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('.kmcc-cookies-toggle-pp input[type="checkbox"]').forEach(check => check.checked = false);

				/* Save & exit. */
				tryToClick('#kmcc-accept-some-cookies', 'Kunstmaan Cookie Bar');
			}
		);

		/* -----------------------------------------------------------------
		 * Stad Gent cookie consent
		 * E.g. https://stad.gent/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'#SG-CookieConsent--TogglePreferencesButton',
			'Stad Gent',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('.SG-CookieConsent--checkbox').forEach(check => check.checked = false);

				/* Save & exit. */
				tryToClick('#SG-CookieConsent--SavePreferencesButton', 'Stad Gent');
			}
		);

		/* -----------------------------------------------------------------
		 * Osano Cookie Consent <https://www.osano.com/cookieconsent>
		 * E.g. https://www.pelotondeparis.cc/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.cc-btn.cc-settings',
			'Osano',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('.cc-settings-dialog input[type="checkbox"]').forEach(
					check => check.checked = false
				);

				/* Save & exit. */
				tryToClick('.cc-btn.cc-btn-accept-selected', 'Osano');
			}
		);

		tryToClick('.osano-cm-denyAll, .osano-cm-button--type_denyAll', 'Osano');

		/* -----------------------------------------------------------------
		 * AdResults Cookie Script <https://adresults.nl/tools/cookie-script/>
		 * E.g. https://www.ekoplaza.nl/
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
		 * E.g. https://www.lehmanns.de/
		 * E.g. https://www.dronten-online.nl/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.cc_dialog button.cc_b_cp, .cc_dialog .btn:not(.cc_b_ok_custom)',
			'Free Privacy Policy',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('.checkbox_cookie_consent').forEach(check => check.checked = false);

				/* Save & exit. */
				tryToClick('.cc_cp_f_save button', 'Free Privacy Policy');
			}
		);

		/* -----------------------------------------------------------------
		 * Iubenda Cookie Solution <https://www.iubenda.com/en/cookie-solution>
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
		 * E.g. https://www.ezoic.com/
		 * E.g. https://www.sheldonbrown.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'#ez-manage-settings, [onclick*="handleShowDetails"], [onclick*="handleManageSettings"]',
			'Ezoic',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('input[type="checkbox"].ez-cmp-checkbox').forEach(check => check.checked = false);

				/* Do the same for all the vendors. */
				clickAndWaitOrDoItNow(
					'#ez-show-vendors, [onclick*="savePurposesAndShowVendors"]',
					'Ezoic',
					_ => {
						deepQuerySelectorAll('input[type="checkbox"].ez-cmp-checkbox').forEach(check => check.checked = false);

						tryToClick('#ez-save-settings, [onclick*="saveVendorsAndExitModal"], [onclick*="handleSaveSettings"]', 'Ezoic');
					}
				);

				/* Save & exit. */
				retryToClick('#ez-save-settings, [onclick*="savePurposesAndExitModal"], [onclick*="handleSaveSettings"]', 'Ezoic');
			}
		);

		/* -----------------------------------------------------------------
		 * Cybot Cookie Dialog
		 * E.g. https://www.cybot.com/
		 * E.g. https://www.bridge.nl/
		 * ----------------------------------------------------------------- */
		const cybotAllowSelectionButton = deepQuerySelector('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection');
		if (cybotAllowSelectionButton) {
			deepQuerySelectorAll('.CybotCookiebotDialogBodyLevelButton').forEach(check => check.checked = false);
			tryToClick(cybotAllowSelectionButton, 'Cybot');
		} else {
			tryToClick('#CybotCookiebotDialogBodyButtonDecline', 'Cybot');
		}

		/* -----------------------------------------------------------------
		 * UserCentrics Consent Management Platform <https://usercentrics.com/> (without Shadow DOM)
		 * E.g. https://www.immoweb.be/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.uc-btn-more',
			'UserCentrics (without Shadow DOM)',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('.uc-category-row input[type="checkbox"]').forEach(check => check.checked = false);

				/* Save & exit. */
				retryToClick('.uc-save-settings-button', 'UserCentrics (without Shadow DOM)');
			}
		);

		/* -----------------------------------------------------------------
		 * UserCentrics Consent Management Platform <https://usercentrics.com/> (with Shadow DOM)
		 * E.g. https://usercentrics.com/
		 * E.g. https://www.rosebikes.nl/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			deepQuerySelector('#usercentrics-root')?.shadowRoot.querySelector('button[data-testid="uc-customize-anchor"]'),
			'UserCentrics (with Shadow DOM)',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelector('#usercentrics-root')?.shadowRoot.querySelectorAll('button[role="switch"]').forEach(
					check => (check.getAttribute('aria-checked') === 'true') && check.click()
				);

				/* Save & exit. */
				retryToClick(deepQuerySelector('#usercentrics-root')?.shadowRoot.querySelector('button[data-testid="uc-save-button"]'), 'UserCentrics (with Shadow DOM)');
			}
		);

		/* -----------------------------------------------------------------
		 * WordPress cookie banner (not on the main domain, but on the hosted sites)
		 * E.g. https://*.wordpress.com/
		 * E.g. https://longreads.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.cmp__banner-buttons button.is-tertiary:first-child',
			'WordPress',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				retryToClick('.cmp__modal-footer-buttons button.is-secondary:nth-child(2)', 'WordPress');
			}
		);

		/* -----------------------------------------------------------------
		 * Automattic cookie banner
		 * E.g. https://wordpress.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.a8c-cookie-banner-customize-button',
			'Automattic',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('.a8c-cookie-banner-options-selection input[type="checkbox"]').forEach(check => check.checked = false);

				/* Save & exit. */
				tryToClick('.a8c-cookie-banner-accept-selection-button', 'Automattic');
			}
		);

		/* -----------------------------------------------------------------
		 * Stack Exchange consent banner
		 * It seems that it is just a re-wrap/re-arrangement of the Onetrust dialog.
		 * E.g. https://stackoverflow.com/questions
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.js-consent-banner .js-cookie-settings',
			'Stack Exchange',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('input[type="checkbox"].js-editor-toggle-state.category-switch-handler').forEach(check => check.checked = false);

				/* Save & exit. */
				setTimeout(_ => retryToClick('.js-consent-save', 'Stack Exchange'), 500);
			}
		);

		/* -----------------------------------------------------------------
		 * Pon Bike (“Pee on bike”? Triathletes, tsss…) Group cookie pop-up
		 * (Possibly a generic Magento 2 module.)
		 * E.g. https://bbbcycling.com/
		 * E.g. https://www.union.nl/
		 * E.g. https://www.focus-bikes.com/
		 * E.g. https://www.kalkhoff-bikes.com/
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
					tryToClick(`#cookie-manager-popup label[for="${check.id}"]`);
					check.checked = false;
				});

				/* Variety 2. */
				deepQuerySelectorAll('#cookie-manager-popup [data-switch="on"]').forEach(fakeCheckbox => {
					/* This is even worse than the first variety. */
					fakeCheckbox.click();
					fakeCheckbox.dataset.switch = 'off';
				});

				/* Save & exit. */
				tryToClick('#cookie-manager-popup .modal-footer button, .cookie-manager-popup .modal-footer button');
			}
		);

		/* -----------------------------------------------------------------
		 * CookiePro (old version, from before they were acquired by Onetrust)
		 * E.g. https://www.nature.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.cc-banner button[data-cc-action="preferences"]',
			'CookiePro',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				tryToClick('.cc-preferences button[data-cc-action="reject"]', 'CookiePro');
			}
		);

		/* -----------------------------------------------------------------
		 * SBFX CMP <https://sfbx.io/en/produits/>
		 * E.g. https://www.rtbf.be/
		 * E.g. https://www.meteo-grenoble.com/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('.frame-content .button__skip', 'SBFX CMP')) {
			clickAndWaitOrDoItNow(
				'.frame-content .button__openPrivacyCenter',
				'SBFX CMP',
				_ => {
					clickAndWaitOrDoItNow(
						/* Reject all possible cookies / object to all possible interests and personalization. */
						'.frame-content .privacy__modalFooter a.link:first-of-type',
						'SBFX CMP',
						_ => {
							/* Save & exit. */
							tryToClick('.frame-content .saveSection button', 'SBFX CMP');
						}
					);
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Traffective Open CMP <https://opencmp.net/> (site not working 2022-01-16)
		 * E.g. https://traffective.com/
		 * E.g. https://www.mactechnews.de/
		 * E.g. https://www.fliegermagazin.de/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.cmp_state-stacks .cmp_mainButtons .cmp_saveLink a',
			'Open CMP',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				tryToClick('.cmp_activateAll a:last-of-type', 'Open CMP (deactivate consent)');

				/* Do the same for the legitimate interests. */
				if (tryToClick('.cmp_level1Container .cmp_levelItem:not(.cmp_active) *', 'Open CMP (go to legitimate interests tab)')) {
					setTimeout(_ => {
						deepQuerySelectorAll('.cmp_activateAll a:last-of-type').forEach((deselectAll, i) => {
							tryToClick(deselectAll, `Open CMP (deactivate legitimate interests, #${i + 1})`);
						});
					}, 250);
				}

				/* Save & exit. */
				setTimeout(_ => {
					retryToClick('.cmp_state-settings .cmp_mainButtons .cmp_saveLink a, .cmp_state-legitimateInterests .cmp_mainButtons .cmp_saveLink a', 'Open CMP (save & exit)');
				}, 500);
			}
		);

		/* -----------------------------------------------------------------
		 * Mediavine GDPR CMP
		 * E.g. https://www.thenordroom.com/
		 * E.g. https://yesmissy.com/
		 * E.g. https://www.literaryladiesguide.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'[data-name="mediavine-gdpr-cmp"] [data-view="manageSettings"]',
			'Mediavine GDPR CMP',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				/* Setting `check.checked = false` is not enough. It seems this is yet another “app” that only updates its internal state `onclick`. */
				deepQuerySelectorAll('[data-name="mediavine-gdpr-cmp"] input[type="checkbox"]:checked').forEach(check => {
					check.click();
					check.checked = false;
				});

				/* Do the same for the partners. */
				if (tryToClick('[data-name="mediavine-gdpr-cmp"] [data-view="partnerSettings"]', 'Mediavine GDPR CMP (go to partners tab)')) {
					setTimeout(_ => {
						deepQuerySelectorAll('[data-name="mediavine-gdpr-cmp"] input[type="checkbox"]:checked').forEach(check => {
							check.click();
							check.checked = false;
						});
					}, 250);
				}

				/* Save & exit. */
				setTimeout(_ => {
					retryToClick('[data-name="mediavine-gdpr-cmp"] [format="secondary"]', 'Mediavine GDPR CMP (save & exit)');
				}, 500);
			}
		);

		/* -----------------------------------------------------------------
		 * Wix cookie consent banner
		 * E.g. https://www.deparcoursbouwer.cc/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'[data-hook="consent-banner-root"] [data-hook="consent-banner-settings-button"]',
			'Wix cookie consent banner',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('[data-hook="consent-banner-settings-container"] input[type="checkbox"]:checked').forEach(check => {
					check.click();
					check.checked = false;
				});

				/* Save & exit. */
				tryToClick('[data-hook="consent-banner-settings-container"] [data-hook="consent-banner-settings-save-button"]', 'Wix cookie consent banner');
			}
		);

		/* -----------------------------------------------------------------
		 * NitroPay CMP <https://nitropay.com/>
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
		 * so it does not matter which of the four states the pop-up is in
		 * when this code executes:
		 * - intro with “More info” button,
		 * - step 1/3 (functional/required cookies) and only a “Next” button,
		 * - step 2/3 (analytical cookies) with a “Decline” and a “Next” button,
		 * - step 3/3 (thank you message) with with a “Close” button,
		 *
		 * E.g. https://www.mskgent.be/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.cookie-notice-portal .cookie-notice__footer button:first-child',
			'Wieni cookie notice (1/3)',
			_ => clickAndWaitOrDoItNow(
				'.cookie-notice-portal .cookie-notice__footer button:first-child',
				'Wieni cookie notice (2/3)',
				_ => clickAndWaitOrDoItNow(
					'.cookie-notice-portal .cookie-notice__footer button:first-child',
					'Wieni cookie notice (3/3)',
					_ => tryToClick('.cookie-notice-portal .cookie-notice__footer button:first-child', 'Wieni cookie notice (close)')
				)
			)
		);

		/* -----------------------------------------------------------------
		 * Google Tag Manager “UXM” (2022-02-20: I could not find *any* info on this, WTF?)
		 * E.g. https://www.vlaamsparlement.be/
		 * E.g. https://mca.be/nl/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'[href="#uxm-settings"]',
			'Google Tag Manager UXM',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('input.uxm-toggle-input[type="checkbox"]:checked').forEach(check => {
					check.click();
					check.checked = false;
				});

				/* Save & exit. */
				tryToClick('#uxm-accept-custom', 'Google Tag Manager UXM');
			}
		);

		/* -----------------------------------------------------------------
		 * Brompton cookie opt-out
		 * E.g. https://www.brompton.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.cookie-panel .optOut', 'Brompton opt-out button');

		/* -----------------------------------------------------------------
		 * Twitter cookie notice
		 *
		 * We can’t use class names or other “obvious” indicators because
		 * they are all mangled by minifiers. :-( Our best bet is to look at
		 * the button texts and hope that they don’t change too much (or the
		 * translations are not too different).
		 *
		 * E.g. https://twitter.com/
		 * E.g. https://mobile.twitter.com/
		 * ----------------------------------------------------------------- */
		if (document.domain === 'twitter.com' || document.domain === 'mobile.twitter.com') {
			const twitterCookieButtons = [];
			deepQuerySelectorAll('[role="button"]').forEach(button => button.textContent.match(/\bcooki/i) && twitterCookieButtons.push(button));
			if (twitterCookieButtons.length === 2) {
				tryToClick(twitterCookieButtons[1], 'Twitter coookie notice (refuse)');
			}
		}

		/* -----------------------------------------------------------------
		 * New York Times cookie notice
		 * E.g. https://www.nytimes.com/
		 * ----------------------------------------------------------------- */
		tryToClick('button[data-testid="GDPR-reject"]', 'NYT cookie notice opt-out button');

		/* -----------------------------------------------------------------
		 * New York Times cookie notice (as used in the Games section)
		 * E.g. https://www.nytimes.com/games/wordle/index.html
		 * ----------------------------------------------------------------- */
		tryToClick('#pz-gdpr-btn-reject', 'NYT cookie notice opt-out button (games version)');

		/* -----------------------------------------------------------------
		 * Complianz cookie consent <https://complianz.io/>
		 * E.g. https://www.pedaleurdeflandres.be/
		 * E.g. https://wpformation.com/
		 * E.g. https://thispointer.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.cmplz-btn.cmplz-deny', 'Complianz cookie consent deny button');

		/* -----------------------------------------------------------------
		 * Cookie Control by CIVIC <https://www.civicuk.com/cookie-control>
		 * E.g. https://www.civicuk.com/
		 * E.g. https://www.mottmac.com/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('#ccc-notify-reject', 'Cookie Control by CIVIC')) {
			clickAndWaitOrDoItNow(
				'.ccc-notify-link, #ccc-icon:not([aria-expanded="true"])',
				'Cookie Control by CIVIC',
				_ => {
					/* Reject all possible cookies / object to all possible interests and personalization. */
					deepQuerySelectorAll('#ccc-content input[type="checkbox"]:checked').forEach(check => {
						check.click();
						check.checked = false;
					});

					/* Save & exit. */
					tryToClick('#ccc-dismiss-button, #ccc-close', 'Cookie Control by CIVIC (save & exit)');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Le Monde GDPR consent
		 * E.g. https://www.lemonde.fr/
		 * ----------------------------------------------------------------- */
		tryToClick('[data-gdpr-expression="denyAll"]', 'Le Monde GDPR consent (“Deny all” button)');

		/* -----------------------------------------------------------------
		 * Inventis cookie consent dialog
		 * E.g. https://www.inventis.be/
		 * E.g. https://www.arenberg.be/
		 * ----------------------------------------------------------------- */
		tryToClick('dialog.cookie-consent button[value="no"]', 'Inventis cookie consent dialog (“Deny” button)');

		/* -----------------------------------------------------------------
		 * Stripe (using a separate page to manage cookies)
		 * E.g. https://www.stripe.com/
		 * ----------------------------------------------------------------- */
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
						deepQuerySelectorAll('[data-js-controller="CookieSettingsSection"] input[type="checkbox"]:checked').forEach(check => {
							check.click();
							check.checked = false;
						});

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

		/* -----------------------------------------------------------------
		 * DeepL cookie banner
		 * E.g. https://www.deepl.com/
		 * ----------------------------------------------------------------- */
		const deepLSaveSelectionButton = deepQuerySelector('.dl_cookieBanner--buttonSelected');
		if (deepLSaveSelectionButton) {
			/* Reject all possible cookies / object to all possible interests and personalization. */
			deepQuerySelectorAll('input[type="checkbox"].dl_cookieBanner--checkbox:checked').forEach(check => {
				check.click();
				check.checked = false;
			});

			/* Save & exit. */
			tryToClick(deepLSaveSelectionButton, 'DeepL cookie banner (save & exit)');
		}

		/* -----------------------------------------------------------------
		 * Deutsche Bahn cookie consent dialog (without Shadow DOM)
		 *
		 * Seems to be a front-end for Tealium’s Univeral Tag <https://docs.tealium.com/platforms/javascript/install/>
		 *
		 * E.g. https://www.bahn.com/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('#consent-layer .js-accept-essential-cookies', 'Deutsche Bahn cookie consent dialog (without Shadow DOM)')) {
			clickAndWaitOrDoItNow(
				'#consent-layer .js-show-cookie-settings',
				'Deutsche Bahn cookie consent dialog (without Shadow DOM)',
				_ => {
					/* Reject all possible cookies / object to all possible interests and personalization. */
					deepQuerySelectorAll('#consent-layer input[type="checkbox"]:checked').forEach(check => {
						check.click();
						check.checked = false;
					});

					/* Save & exit. */
					tryToClick('#consent-layer .js-accept-selected-cookies', 'Deutsche Bahn cookie consent dialog (without Shadow DOM) (save & exit)');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Deutsche Bahn cookie consent dialog (with Shadow DOM)
		 *
		 * E.g. https://reiseauskunft.bahn.de/
		 * ----------------------------------------------------------------- */
		const bahnShadowRoot = deepQuerySelector('body > div:first-child')?.shadowRoot;
		if (bahnShadowRoot && !tryToClick(bahnShadowRoot.querySelector('#consent-layer .js-accept-essential-cookies'), 'Deutsche Bahn cookie consent dialog (with Shadow DOM)')) {
			clickAndWaitOrDoItNow(
				bahnShadowRoot.querySelector('#consent-layer .js-show-cookie-settings'),
				'Deutsche Bahn cookie consent dialog (with Shadow DOM)',
				_ => {
					/* Reject all possible cookies / object to all possible interests and personalization. */
					bahnShadowRoot.querySelectorAll('#consent-layer input[type="checkbox"]:checked').forEach(check => {
						check.click();
						check.checked = false;
					});

					/* Save & exit. */
					tryToClick(bahnShadowRoot.querySelector('#consent-layer .js-accept-selected-cookies'), 'Deutsche Bahn cookie consent dialog (with Shadow DOM) (save & exit)');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Tarte Au Citron / tarteaucitron.js <https://tarteaucitron.io/>
		 * E.g. https://tarteaucitron.io/
		 * E.g. https://www.scandiberique.fr/
		 * ----------------------------------------------------------------- */
		tryToClick('.tarteaucitronDeny', 'tarteaucitron.js (“Deny all” button)');

		/* -----------------------------------------------------------------
		 * bsgdprcookies by Aleksander Woźnica <https://github.com/Aleksander98/bsgdprcookies>
		 * E.g. https://www.jqueryscript.net/demo/GDPR-Cookie-Consent-Bootstrap-4-bsgdprcookies/
		 * E.g. https://paradisio-online.be/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'#bs-gdpr-cookies-modal-advanced-btn',
			'bsgdprcookies',
			_ => {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('input[type="checkbox"][name="bsgdpr[]"]:checked').forEach(check => {
					check.click();
					check.checked = false;
				});

				/* Save & exit. */
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
				/* Reject all possible cookies / object to all possible interests and personalization. */
				deepQuerySelectorAll('.as-m-popover input[type="checkbox"][name="cookie-group"]:checked').forEach(check => {
					check.click();
					check.checked = false;
				});

				/* Save & exit. */
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
		 * Out-of-origin IFRAMEs.
		 * ----------------------------------------------------------------- */
		deepQuerySelectorAll(externalConsentManagerIframeSelectors.join(',')).forEach(
			iframe => {
				probableExternalConsentManagerIframeUris.push(iframe.src);
				probableExternalConsentManagerIframes.push(iframe);
			}
		);
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

		const div = iframe.parentNode.insertBefore(iframe.ownerDocument.createElement('div'), iframe.nextSibling);
		div.classList.add('xxxJanProbableExternalConsentManagerAttentionGrabber');
		div.style.width = `${iframe.offsetWidth - (outlineWidth * 2)}px`;
		div.style.height = `${iframe.offsetHeight - (outlineWidth * 2)}px`;
		div.style.left = `${iframeBounds.x + outlineWidth}px`;
		div.style.top = `${iframeBounds.y + outlineWidth}px`;
		div.style.zIndex = iframe.ownerDocument?.defaultView?.getComputedStyle(iframe)?.zIndex ?? 1969 /* in the sunshine */;
		div.addEventListener('animationend', _ => div.remove());

		const style = document.createElement('style');
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
