/**
 * Close the cookies/tracking/personalization permission dialog rejecting all
 * non-essential cookies and objecting to all legitimate uses.
 *
 * @title ⛔🍪⛔
 */
(function nocookies() {
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
		'iframe[src*=".trustarc.com/"]',
		'iframe[src*=".consensu.org/"]',
		'iframe[src*=".privacy-mgmt.com/"]',
		'iframe[src*=".privacymanager.io/"]',
		'iframe[src*="/sourcepoint.theguardian.com/"]',
	];
	const probableExternalConsentManagerIframeUris = [];


	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		/**
		 * If there is an `openButtonElementOrSelector`, click the corresponding
		 * element and wait a bit before calling the `setAndSaveFunction`. If
		 * there is no such element, immediately call the function.
		 */
		function openAndWaitOrDoItNow(openButtonElementOrSelector, provider, setAndSaveFunction) {
			const openButton = typeof openButtonElementOrSelector === 'string'
				? document.querySelector(openButtonElementOrSelector)
				: openButtonElementOrSelector;

			if (openButton) {
				console.log(`nocookies: found ${provider} button to open settings: `, openButtonElementOrSelector, openButton === openButtonElementOrSelector ? '(element specified directly; no selector given)' : openButton);
				openButton.click();
				setTimeout(setAndSaveFunction, 250);
			} else {
				setAndSaveFunction();
			}
		}

		/**
		 * Call the `click` function on the first element that matches the
		 * given selector. Alternatively, you can specify an element
		 * directly, or a callback that returns an element.
		 */
		function tryToClick(selectorOrElementOrCallback, provider) {
			let elem = selectorOrElementOrCallback;
			if (typeof selectorOrElementOrCallback === 'string') {
				elem = document.querySelector(selectorOrElementOrCallback);
			} else if (typeof selectorOrElementOrCallback === 'function') {
				elem = selectorOrElementOrCallback(document);
			}

			if (elem) {
				console.log(`nocookie: found ${provider} button to click: `, elem);
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
		function retryToClick(selectorOrElementOrCallback, provider, maxNumMilliseconds) {
			if (typeof maxNumMilliseconds === 'undefined') {
				maxNumMilliseconds = 5000;
			}
			const startTimestamp = +new Date();
			const numMillisecondsBetweenTries = 100;

			const retrier = _ => {
				const currTimestamp = +new Date();

				if (tryToClick(selectorOrElementOrCallback, provider)) {
					const numMillisecondsElapsed = currTimestamp - startTimestamp;
					if (numMillisecondsElapsed >= numMillisecondsBetweenTries) {
						console.log(`nocookie: found button to click after ${numMillisecondsElapsed} milliseconds.`);
					}

					return;
				}

				if (currTimestamp + numMillisecondsBetweenTries <= startTimestamp + maxNumMilliseconds) {
					setTimeout(retrier, numMillisecondsBetweenTries);
				}
			};

			retrier();
		}


		/* -----------------------------------------------------------------
		 * Drupal’s EU Cookie Compliance (GDPR Compliance) banner <https://www.drupal.org/project/eu_cookie_compliance>
		 * E.g. https://dropsolid.com/
		 * E.g. https://www.mo.be/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('.eu-cookie-compliance-banner .decline-button', 'Drupal')) {
			const euCookieComplianceCategoryCheckboxes = document.querySelectorAll('.eu-cookie-compliance-categories input[type="checkbox"][name="cookie-categories"]');
			if (euCookieComplianceCategoryCheckboxes.length) {
				euCookieComplianceCategoryCheckboxes.forEach(check => check.checked = false);
				tryToClick('.eu-cookie-compliance-banner .eu-cookie-compliance-save-preferences-button', 'Drupal');
			}
		}


		/* -----------------------------------------------------------------
		 * TrustArc cookie banner
		 * ----------------------------------------------------------------- */
		tryToClick('#truste-consent-required', 'TrustArc');


		/* -----------------------------------------------------------------
		 * Bol.com cookie dialog
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
		 * Google Funding Choices <https://developers.google.com/funding-choices>
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'.fc-cta-manage-options',
			'Google Funding Choices',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				Array.from(document.querySelectorAll('.fc-preference-legitimate-interest, input[type="checkbox"][id*="egitimate"]')).forEach(
					check => check.checked = false
				);

				/* Save & exit. */
				tryToClick('.fc-confirm-choices', 'Google Funding Choices');
			}
		);


		/* -----------------------------------------------------------------
		 * Google’s own properties (not using their own Funding Choices…)
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'[aria-modal="true"][title*="Google"] button:first-child:not(:only-child):not([aria-haspopup="true"]), '
				+ 'a.ytd-button-renderer[href^="https://consent.youtube.com/"]',
			'Google',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('c-wiz div[jsaction]:first-child:not(:only-child) button').forEach(
					button => button.click()
				);

				/* Save & exit. */
				tryToClick('c-wiz form[jsaction^="submit:"] button', 'Google');
			}
		);


		/* -----------------------------------------------------------------
		 * Yahoo IAB cookie consent
		 * E.g. https://techcrunch.com/
		 * E.g. https://www.yahoo.com/
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'#consent-page .manage-settings',
			'Yahoo IAB',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				const iabCookieComplianceCategoryCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"][data-toggle-type="legit"], input[type="checkbox"][data-toggle-type="consent"]'));
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
		 * Onetrust
		 * E.g. https://www.booking.com/
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'#onetrust-pc-btn-handler',
			'Onetrust',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				Array.from(document.querySelectorAll('#onetrust-consent-sdk input[type="checkbox"]')).forEach(
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
		openAndWaitOrDoItNow(
			'#didomi-notice-learn-more-button',
			'Didomi',
			function () {
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
		openAndWaitOrDoItNow(
			'.qc-cmp2-summary-buttons button[mode="secondary"]',
			'Quantcast',
			function () {
				/* Cycle through the “Partners” and “Legitimate interest” tabs. */
				document.querySelectorAll('.qc-cmp2-footer-links button').forEach(tabButton => {
					tabButton.click();

					/* Click the corresponding “REJECT ALL” or “OBJECT ALL” button. */
					document.querySelectorAll('.qc-cmp2-header-links button:nth-of-type(1)').forEach(
						/* TODO: make this language-independent, if possible */
						justSayNoButton => justSayNoButton.textContent.match(/(reject|object) all/i) && justSayNoButton.click()
					);
				});

				/* Click the “Save & exit” button. */
				retryToClick('.qc-cmp2-footer button[mode="primary"]', 'Quantcast');
			}
		);


		/* -----------------------------------------------------------------
		 * Fandom/Wikia
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'[data-tracking-opt-in-learn-more="true"]',
			'Fandom/Wikia',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('[data-tracking-opt-in-overlay="true"] input[type="checkbox"]').forEach(check => check.checked = false);

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
		openAndWaitOrDoItNow(
			'.js-kmcc-extended-modal-button[data-target="legal_cookie_preferences"]',
			'Kunstmaan Cookie Bar',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('.kmcc-cookies-toggle-pp input[type="checkbox"]').forEach(check => check.checked = false);

				/* Save & exit. */
				tryToClick('#kmcc-accept-some-cookies', 'Kunstmaan Cookie Bar');
			}
		);


		/* -----------------------------------------------------------------
		 * Stad Gent cookie consent
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'#SG-CookieConsent--TogglePreferencesButton',
			'Stad Gent',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('.SG-CookieConsent--checkbox').forEach(check => check.checked = false);

				/* Save & exit. */
				tryToClick('#SG-CookieConsent--SavePreferencesButton', 'Stad Gent');
			}
		);


		/* -----------------------------------------------------------------
		 * Osano Cookie Consent <https://www.osano.com/cookieconsent>
		 * E.g. https://www.pelotondeparis.cc/
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'.cc-btn.cc-settings',
			'Osano',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				Array.from(document.querySelectorAll('.cc-settings-dialog input[type="checkbox"]')).forEach(
					check => check.checked = false
				);

				/* Save & exit. */
				tryToClick('.cc-btn.cc-btn-accept-selected', 'Osano');
			}
		);


		/* -----------------------------------------------------------------
		 * AdResults Cookie Script <https://adresults.nl/tools/cookie-script/>
		 * E.g. https://www.ekoplaza.nl/
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'a[href="#"].cookie_tool_more, #cookie_tool_config',
			'AdResults',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				(document.querySelector('input[name="cookie_tool_choise"][value="3"]') ?? {}).checked = true;

				/* Save & exit. */
				tryToClick('.cookie_tool_submit', 'AdResults');
			}
		);


		/* -----------------------------------------------------------------
		 * Free Privacy Policy’s Cookie Consent <https://www.freeprivacypolicy.com/free-cookie-consent/>
		 * E.g. https://www.lehmanns.de/
		 * E.g. https://www.dronten-online.nl/
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'.cc_dialog button.cc_b_cp, .cc_dialog .btn:not(.cc_b_ok_custom)',
			'Free Privacy Policy',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('.checkbox_cookie_consent').forEach(check => check.checked = false);

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
			openAndWaitOrDoItNow(
				'.iubenda-cs-customize-btn',
				'Iubenda',
				function () {
					if (!tryToClick('[class*="iubenda"] .purposes-btn-reject', 'Iubenda Cookie Solution')) {
						openAndWaitOrDoItNow(
							'#iubFooterBtnIab',
							'Iubenda',
							function () {
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
		openAndWaitOrDoItNow(
			'#ez-manage-settings, [onclick*="handleShowDetails"], [onclick*="handleManageSettings"]',
			'Ezoic',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('input[type="checkbox"].ez-cmp-checkbox').forEach(check => check.checked = false);

				/* Do the same for all the vendors. */
				openAndWaitOrDoItNow(
					'#ez-show-vendors, [onclick*="savePurposesAndShowVendors"]',
					'Ezoic',
					_ => {
						document.querySelectorAll('input[type="checkbox"].ez-cmp-checkbox').forEach(check => check.checked = false);

						tryToClick('#ez-save-settings, [onclick*="saveVendorsAndExitModal"], [onclick*="handleSaveSettings"]', 'Ezoic');
					}
				);

				/* Save & exit. */
				retryToClick('#ez-save-settings, [onclick*="savePurposesAndExitModal"], [onclick*="handleSaveSettings"]', 'Ezoic');
			}
		);


		/* -----------------------------------------------------------------
		 * Cybot Cookie Dialog
		 * ----------------------------------------------------------------- */
		const cybotAllowSelectionButton = document.querySelector('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowallSelection');
		if (cybotAllowSelectionButton) {
			document.querySelectorAll('.CybotCookiebotDialogBodyLevelButton').forEach(check => check.checked = false);
			cybotAllowSelectionButton.click();
		} else {
			document.querySelector('#CybotCookiebotDialogBodyButtonDecline')?.click();
		}


		/* -----------------------------------------------------------------
		 * UserCentrics Consent Management Platform <https://usercentrics.com/> (without Shadow DOM)
		 * E.g. https://www.immoweb.be/
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'.uc-btn-more',
			'UserCentrics (without Shadow DOM)',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('.uc-category-row input[type="checkbox"]').forEach(check => check.checked = false);

				/* Save & exit. */
				retryToClick('.uc-save-settings-button', 'UserCentrics (without Shadow DOM)');
			}
		);


		/* -----------------------------------------------------------------
		 * UserCentrics Consent Management Platform <https://usercentrics.com/> (with Shadow DOM)
		 * E.g. https://usercentrics.com/
		 * E.g. https://www.rosebikes.nl/
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			document.querySelector('#usercentrics-root')?.shadowRoot.querySelector('button[data-testid="uc-customize-anchor"]'),
			'UserCentrics (with Shadow DOM)',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelector('#usercentrics-root')?.shadowRoot.querySelectorAll('button[role="switch"]').forEach(
					check => (check.getAttribute('aria-checked') === 'true') && check.click()
				);

				/* Save & exit. */
				retryToClick(document => document.querySelector('#usercentrics-root')?.shadowRoot.querySelector('button[data-testid="uc-save-button"]'), 'UserCentrics (with Shadow DOM)');
			}
		);


		/* -----------------------------------------------------------------
		 * Out-of-origin IFRAMEs.
		 * ----------------------------------------------------------------- */
		document.querySelectorAll(externalConsentManagerIframeSelectors.join(',')).forEach(
			iframe => probableExternalConsentManagerIframeUris.push(iframe.src)
		);


		/* ================================================================= */


		/* Recurse for (i)frames. */
		try {
			Array.from(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(
				elem => { try { execute(elem.contentDocument) } catch (e) { } }
			);
		} catch (e) {
			/* Catch and ignore exceptions for out-of-domain access. */
		}
	}

	execute(document);

	/* Show out-of-origin IFRAMEs of external consent managers. */
	if (probableExternalConsentManagerIframeUris.length === 1) {
		alert(`There appears to be an IFRAME of an external consent manager. This bookmarklet cannot access that IFRAME, sorry.\n\nURI: ${probableExternalConsentManagerIframeUris[0]}`);
	} else if (probableExternalConsentManagerIframeUris.length > 1) {
		alert(`There appear to be ${probableExternalConsentManagerIframeUris.length} IFRAMEs of an external consent manager. This bookmarklet cannot access such IFRAME, sorry.\n\nURIs:\n* ${probableExternalConsentManagerIframeUris.join('\n\n* ')}`);
	}
})();
