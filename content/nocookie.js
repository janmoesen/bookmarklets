/**
 * Close the cookies/tracking/personalization permission dialog rejecting all
 * non-essential cookies and objecting to all legitimate uses.
 *
 * @title ⛔🍪⛔
 */
(function nocookie() {
	'use strict';

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

			/* Click after a small timeout to make sure the `console.log()`
			 * is executed before potentially unloading the page, e.g.
			 * because the `click()` submits a form. */
			setTimeout(_ => elem.click(), 50);

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
		 * Bol.com cookie dialog
		 *
		 * E.g. https://www.bol.com/
		 * ----------------------------------------------------------------- */
		tryToClick('button[data-test="consent-modal-ofc-reject-btn"]#js-reject-all-button', 'Bol.com');

		/* -----------------------------------------------------------------
		 * Cookie-Script <https://cookie-script.com/>
		 * ----------------------------------------------------------------- */
		tryToClick('#cookiescript_reject', 'Cookie-Script');

		/* -----------------------------------------------------------------
		 * CookieYes/Cookie-Law-Info <https://wordpress.org/plugins/cookie-law-info/>
		 * ----------------------------------------------------------------- */
		tryToClick('#cookie_action_close_header_reject, [data-cky-tag="reject-button"], .cky-btn-reject', 'CookieYes/Cookie-Law-Info');

		/* -----------------------------------------------------------------
		 * PayPal.com cookie dialog
		 *
		 * E.g. https://www.paypal.com/
		 * ----------------------------------------------------------------- */
		tryToClick('#gdprCookieBanner #bannerDeclineButton', 'PayPal');

		/* -----------------------------------------------------------------
		 * CookieCuttr jQuery/WordPress plug-in <http://cookiecuttr.com/>
		 *
		 * E.g. http://cookiecuttr.com/
		 * E.g. https://www.findcrowdfunding.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.cc-cookies .cc_cookie_decline, .cc-cookies .cc-cookie-decline', 'CookieCuttr');

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
		 * Toerisme Oost-Vlaanderen’s cookie banner
		 *
		 * E.g. https://www.routen.be/
		 * ----------------------------------------------------------------- */
		tryToClick('.cookie--accept-necessary, .js--cookie--accept-necessary', 'Toerisme Oost-Vlaanderen');

		/* -----------------------------------------------------------------
		 * HubSpot’s cookie banner <https://www.hubspot.com/data-privacy/gdpr>
		 *
		 * E.g. https://www.hubspot.com/
		 * E.g. https://www.mdi.lu/
		 * ----------------------------------------------------------------- */
		tryToClick('#hs-eu-decline-button', 'HubSpot');

		/* -----------------------------------------------------------------
		 * NewScientist.nl cookie compliance
		 *
		 * E.g. https://www.newscientist.nl/
		 * ----------------------------------------------------------------- */
		tryToClick('.cc-compliance .cc-dismiss', 'NewScientist.nl');

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
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.fc-cta-manage-options',
			'Google Funding Choices',
			_ => {
				tryToUncheck('.fc-preference-legitimate-interest, input[type="checkbox"][id*="egitimate"]');
				tryToClick('.fc-confirm-choices', 'Google Funding Choices');
			}
		);

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
		clickAndWaitOrDoItNow(
			'#onetrust-pc-btn-handler',
			'Onetrust',
			_ => {
				tryToUncheck('#onetrust-consent-sdk input[type="checkbox"]:checked');
				tryToClick('.onetrust-close-btn-handler', 'Onetrust');
			}
		);

		/* -----------------------------------------------------------------
		 * Didomi
		 *
		 * E.g. https://www.didomi.io/
		 * E.g. https://www.oui.sncf/
		 * E.g. https://www.jobat.be/ (2023-03-20: still without “Deny all”)
		 * E.g. https://www.zimmo.be/ (2023-03-20: still without “Deny all”)
		 * E.g. https://www.rtbf.be/ (2023-03-20: still without “Deny all”)
		 * ----------------------------------------------------------------- */
		if (!tryToClick('#didomi-notice-disagree-button, .didomi-continue-without-agreeing', 'Didomi')) {
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
		 * Coolblue cookie dialog
		 *
		 * E.g. https://www.coolblue.nl/
		 * E.g. https://www.coolblue.be/
		 * ----------------------------------------------------------------- */
		tryToClick('[class*="cookie"] button[name="decline_cookie"]', 'Coolblue');

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
		 * Ekoplaza.nl Vue.js thing (no further info)
		 *
		 * E.g. https://www.ekoplaza.nl/
		 * ----------------------------------------------------------------- */
		tryToClick('.cookie-box a.btn-plain[href="javascript:;"]', 'Ekoplaza.nl Vue.js thing');

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
		 * ----------------------------------------------------------------- */
		tryToClick('#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll, #CybotCookiebotDialogBodyButtonDecline', 'Cybot');

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
				 * node for `retryToFix` and `tryToFix`, but that is more work
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
		 * Stack Exchange consent banner
		 * It seems that it is just a re-wrap/re-arrangement of the Onetrust dialog.
		 *
		 * E.g. https://stackoverflow.com/questions
		 * ----------------------------------------------------------------- */
		tryToClick('.js-consent-banner .js-reject-cookies', 'Stack Exchange');

		/* -----------------------------------------------------------------
		 * Pon Bike (“Pee on bike”? Triathletes, tsss…) Group cookie pop-up
		 * (Possibly a generic Magento 2 module.)
		 *
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
		 *
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
		 *
		 * E.g. https://www.meteo-grenoble.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.frame-content .button__refuseAll, .frame-content .button__skip', 'SBFX AppConsent')
			|| tryToClick('.frame-content button[aria-roledescription="link"]:only-child', 'SBFX AppConsent (brittle selector!)');

		/* -----------------------------------------------------------------
		 * Traffective Open CMP <https://opencmp.net/> (site not working 2022-01-16)
		 *
		 * E.g. https://traffective.com/
		 * E.g. https://www.mactechnews.de/
		 * E.g. https://www.fliegermagazin.de/
		 * ----------------------------------------------------------------- */
		const openCmpShadowHost = document.querySelector('body > div.needsclick');
		const openCmpShadowRoot = openCmpShadowHost?.shadowRoot;
		if (openCmpShadowHost && !openCmpShadowRoot) {
			let alreadyHasShadowRoot = false;
			try {
				openCmpShadowHost.attachShadow({mode: 'open'});
			} catch (e) {
				alreadyHasShadowRoot = true;
			}

			if (alreadyHasShadowRoot) {
				console.log('nocookie: found Open CMP with closed shadow DOM; can’t access the options using JavaScript, so simply removing the shadow host (which is not remembered across page loads, unfortunately):', openCmpShadowHost);
				openCmpShadowHost.remove();
			}
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
		 * Wix cookie consent banner (only used on Wix.com?)
		 *
		 * E.g. https://www.wix.com/
		 * ----------------------------------------------------------------- */
		tryToClick('[data-hook="ccsu-banner-decline-all"]', 'Wix.com cookie consent');

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
		 *
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
		 *
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
		 *
		 * E.g. https://www.nytimes.com/
		 * ----------------------------------------------------------------- */
		tryToClick('button[data-testid="GDPR-reject"]', 'NYT cookie notice opt-out button');

		/* -----------------------------------------------------------------
		 * New York Times cookie notice (as used in the Games section)
		 *
		 * E.g. https://www.nytimes.com/games/wordle/index.html
		 * ----------------------------------------------------------------- */
		tryToClick('#pz-gdpr-btn-reject', 'NYT cookie notice opt-out button (games version)');

		/* -----------------------------------------------------------------
		 * Complianz cookie consent <https://complianz.io/>
		 *
		 * E.g. https://www.pedaleurdeflandres.be/
		 * E.g. https://wpformation.com/
		 * E.g. https://thispointer.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.cmplz-btn.cmplz-deny', 'Complianz cookie consent deny button');

		/* -----------------------------------------------------------------
		 * Cookie Control by CIVIC <https://www.civicuk.com/cookie-control>
		 *
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
		 *
		 * E.g. https://www.lemonde.fr/
		 * ----------------------------------------------------------------- */
		tryToClick('[data-gdpr-expression="denyAll"]', 'Le Monde GDPR consent (“Deny all” button)');

		/* -----------------------------------------------------------------
		 * Inventis cookie consent dialog
		 *
		 * E.g. https://www.inventis.be/
		 * E.g. https://www.arenberg.be/
		 * ----------------------------------------------------------------- */
		tryToClick('dialog.cookie-consent button[value="no"]', 'Inventis cookie consent dialog (“Deny” button)');

		/* -----------------------------------------------------------------
		 * Stripe (using a separate page to manage cookies)
		 *
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
		 *
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
		 * TikTok’s cookie banner
		 *
		 * E.g. https://www.tiktok.com/
		 * ----------------------------------------------------------------- */
		const tikTokShadowRoot = deepQuerySelector('tiktok-cookie-banner')?.shadowRoot;
		if (tikTokShadowRoot) {
			tryToClick(tikTokShadowRoot.querySelector('.tiktok-cookie-banner button'), 'TikTok cookie banner (with Shadow DOM)');
		}

		/* -----------------------------------------------------------------
		 * IAB (Interactive Advertising Bureau) CMP
		 *
		 * E.g. https://slashdot.org/
		 * ----------------------------------------------------------------- */
		tryToClick('.cmpboxbtnno', 'IAB');

		/* -----------------------------------------------------------------
		 * GRRR Cookie Consent dialog <https://github.com/grrr-amsterdam/cookie-consent>
		 *
		 * E.g. https://www.horstartsandmusic.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.cookie-consent__btnSome', 'GRRR Cookie Consent');

		/* -----------------------------------------------------------------
		 * WPEka GDPR Cookie Consent (“WP Cookie Notice for GDPR, CCPA & ePrivacy Consent”) <https://club.wpeka.com/product/wp-gdpr-cookie-consent/>
		 *
		 * E.g. https://demo.wpeka.com/wp-gdpr-cookie-consent/
		 * E.g. https://innoventum.se/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('[data-gdpr_action="reject"]', 'WPEka GDPR Cookie Consent')) {
			clickAndWaitOrDoItNow(
				'[data-gdpr_action="settings"]',
				'WPEka GDPR Cookie Consent',
				_ => {
					/* Reject all possible cookies / object to all possible interests and personalization. */
					deepQuerySelectorAll('input[type="checkbox"][name^="gdpr_messagebar_"], input[type="checkbox"][id^="gdpr_messagebar_"]').forEach(check => {
						check.click();
						check.checked = false;
					});

					/* Save & exit. */
					tryToClick('#cookie_action_save[data-gdpr_action="accept"]', 'WPEka GDPR Cookie Consent (save & exit)');
				}
			);
		}

		/* -----------------------------------------------------------------
		 * Strava Cookie Banner
		 *
		 * E.g. https://www.strava.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.btn-deny-cookie-banner', 'Strava Cookie Banner');

		/* -----------------------------------------------------------------
		 * OVH (hosting provider), using an old version of tagContainer
		 * Privacy by Tag Commander (now Commanders Act).
		 *
		 * E.g. https://www.ovhtelecom.fr/
		 * ----------------------------------------------------------------- */
		tryToClick('[data-tc-privacy="cookie-banner::decline"]', 'OVH cookie consent dialog');

		/* -----------------------------------------------------------------
		 * OVH (hosting provider), using an in-house solution.
		 *
		 * E.g. https://www.ovh.com/manager/
		 * ----------------------------------------------------------------- */
		tryToClick('.oui-button.deny', 'OVH cookie consent dialog (2)');

		/* -----------------------------------------------------------------
		 * Bing cookie bar
		 *
		 * E.g. https://www.bing.com/
		 * ----------------------------------------------------------------- */
		tryToClick('#bnp_btn_reject, .bnp_btn_reject', 'Bing');

		/* -----------------------------------------------------------------
		 * Cookie Plus WordPress plugin <https://wpcookieplus.com/>
		 *
		 * E.g. https://www.minieurope.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.cookieplus-btn-decline-cookies', 'Cookie Plus');

		/* -----------------------------------------------------------------
		 * 2dehands.be (and possibly other eBay properties, but not marktplaats.nl) GDPR consent.
		 *
		 * E.g. https://www.2dehands.be/
		 * ----------------------------------------------------------------- */
		tryToClick('#gdpr-consent-banner-refuse-button, .gdpr-consent-button-refuse', '2dehands.be GDPR consent');

		/* -----------------------------------------------------------------
		 * Reddit EU Cookie Policy toast
		 *
		 * Because of CSS class name mangling/minimizing, the selector relies
		 * heavily on the DOM structure and is therefore pretty fragile.
		 *
		 * E.g. https://www.reddit.com/
		 * ----------------------------------------------------------------- */
		tryToClick('section section section + section button[role="button"]', 'Reddit EU Cookie Policy toast');

		/* -----------------------------------------------------------------
		 * The Verge cookie banner
		 *
		 * This selector ass-u-mes the “Reject all” button is meant *not* to
		 * stand out with a different background color.
		 *
		 * E.g. https://www.theverge.com/
		 * ----------------------------------------------------------------- */
		tryToClick('.duet--cta--cookie-banner * button:not([class*=" bg-"])', 'The Verge cookie banner');

		/* -----------------------------------------------------------------
		 * Instagram cookie dialog
		 *
		 * E.g. https://www.instagram.com/
		 * ----------------------------------------------------------------- */
		tryToClick('[style*="--tos-box"] [role="dialog"] button[tabindex]', 'Instagram cookie dialog');

		/* -----------------------------------------------------------------
		 * Happy Socks cookie consent
		 *
		 * E.g. https://www.happysocks.com/
		 * ----------------------------------------------------------------- */
		clickAndWaitOrDoItNow(
			'.cookies-consent-banner button.manage-settings',
			'Happy Socks',
			_ => {
				/* Try the newly appeared “Only required cookies” button. */
				if (!tryToClick('.cookies-consent-banner button.required-only', 'Happy Socks')) {
					/* Reject all possible cookies / object to all possible interests and personalization. */
					deepQuerySelectorAll('.cookies-consent-banner input[type="checkbox"]:checked').forEach(check => {
						check.click();
						check.checked = false;
					});

					/* Save & exit. */
					tryToClick('.cookies-consent-banner button.confirm', 'Happy Socks');
				}
			}
		);

		/* -----------------------------------------------------------------
		 * Borlabs Cookie
		 *
		 * E.g. https://borlabs.io/borlabs-cookie/
		 * E.g. https://www.buchinger-wilhelmi.com/
		 * ----------------------------------------------------------------- */
		if (!tryToClick('[data-cookie-refuse]', 'Borlabs Cookie')) {
			clickAndWaitOrDoItNow(
				'[data-cookie-individual]',
				'Borlabs Cookie',
				_ => {
					/* Reject all possible cookies / object to all possible interests and personalization. */
					deepQuerySelectorAll('[data-borlabs-cookie-switch]:checked').forEach(check => {
						/* If this checkbox was toggled after clicking another checkbox
						 * (e.g. a checkbox that represents entire group), don’t trigger
						 * another click, as that would inadvertently re-check the box. */
						if (check.checked === false) {
							return;
						}

						check.click();
						check.checked = false;
					});

					/* Save & exit. */
					tryToClick('[data-cookie-accept]', 'Borlabs Cookie');
				}
			);

		}

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
