/**
 * Close the cookies/tracking/personalization permission dialog rejecting all
 * non-essential cookies and objecting to all legitimate uses.
 *
 * @title ⛔🍪⛔
 */
(function nocookies() {
	'use strict';

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		/**
		 * If there is an `openButtonElementOrSelector`, click it and wait a bit
		 * before calling the `setAndSaveFunction`. If there is no button,
		 * immediately call the function.
		 */
		function openAndWaitOrDoItNow(openButtonElementOrSelector, setAndSaveFunction) {
			const openButton = typeof openButtonElementOrSelector === 'string'
				? document.querySelector(openButtonElementOrSelector)
				: openButtonElementOrSelector;

			if (openButton) {
				/* XXX → DELME → */ console.log('nocookies: found button to open settings: ', openButtonElementOrSelector, openButton === openButtonElementOrSelector ? '' : openButton);
				openButton.click();
				setTimeout(setAndSaveFunction, 250);
			} else {
				setAndSaveFunction();
			}
		}


		/* -----------------------------------------------------------------
		 * Drupal’s EU Cookie Compliance (GDPR Compliance) banner <https://www.drupal.org/project/eu_cookie_compliance>
		 * ----------------------------------------------------------------- */
		document.querySelector('.eu-cookie-compliance-banner .decline-button')?.click();


		/* -----------------------------------------------------------------
		 * Iubenda Cookie Solution <https://www.iubenda.com/en/cookie-solution>
		 * ----------------------------------------------------------------- */
		document.querySelector('.iubenda-cs-reject-btn')?.click();


		/* -----------------------------------------------------------------
		 * TrustArc cookie banner
		 * ----------------------------------------------------------------- */
		document.querySelector('#truste-consent-required')?.click();


		/* -----------------------------------------------------------------
		 * Bol.com cookie dialog
		 * ----------------------------------------------------------------- */
		document.querySelector('button[data-test="consent-modal-decline-btn"].js-decline-button')?.click();


		/* -----------------------------------------------------------------
		 * Google Funding Choices <https://developers.google.com/funding-choices>
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'.fc-cta-manage-options',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				Array.from(document.querySelectorAll('.fc-preference-legitimate-interest, input[type="checkbox"][id*="egitimate"]')).forEach(
					check => check.checked = false
				);

				/* Save & exit. */
				document.querySelector('.fc-confirm-choices')?.click();
			}
		);


		/* -----------------------------------------------------------------
		 * Google’s own properties (not using their own Funding Choices…)
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'[aria-modal="true"][title*="Google"] button:first-child:not(:only-child):not([aria-haspopup="true"])',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('c-wiz div[jsaction]:first-child:not(:only-child) button').forEach(
					button => button.click()
				);

				/* Save & exit. */
				document.querySelector('c-wiz form[jsaction^="submit:"] button')?.click();
			}
		);


		/* -----------------------------------------------------------------
		 * Yahoo IAB
		 * ----------------------------------------------------------------- */
		/* TODO: click the necessary buttons, too. */
		Array.from(document.querySelectorAll('input[type="checkbox"][data-toggle-type="legit"]')).forEach(
			check => check.checked = false
		);


		/* -----------------------------------------------------------------
		 * Onetrust
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'#onetrust-pc-btn-handler',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				Array.from(document.querySelectorAll('#onetrust-consent-sdk input[type="checkbox"]')).forEach(
					check => check.checked = false
				);

				/* Save & exit. */
				document.querySelector('.onetrust-close-btn-handler')?.click();
			}
		);


		/* -----------------------------------------------------------------
		 * Didomi
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'#didomi-notice-learn-more-button',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				setTimeout(_ => document.querySelector('.didomi-consent-popup-actions button:first-of-type')?.click(), 50);

				/* Save & exit. */
				setTimeout(_ => document.querySelector('.didomi-consent-popup-actions button:first-of-type')?.click(), 100);
			}
		);


		/* -----------------------------------------------------------------
		 * Quantcast
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'.qc-cmp2-summary-buttons button[mode="secondary"]',
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
				setTimeout(_ => document.querySelector('.qc-cmp2-footer button[mode="primary"]')?.click(), 50);
			}
		);


		/* -----------------------------------------------------------------
		 * Didomi
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'#didomi-notice-learn-more-button',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				setTimeout(_ => document.querySelector('.didomi-consent-popup-actions button:first-of-type')?.click(), 50);

				/* Save & exit. */
				setTimeout(_ => document.querySelector('.didomi-consent-popup-actions button:first-of-type')?.click(), 100);
			}
		);


		/* -----------------------------------------------------------------
		 * Fandom/Wikia
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'[data-tracking-opt-in-learn-more="true"]',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('[data-tracking-opt-in-overlay="true"] input[type="checkbox"]').forEach(check => check.checked = false);

				/* Save & exit. */
				setTimeout(_ => document.querySelector('[data-tracking-opt-in-save="true"]')?.click(), 100);
			}
		);


		/* -----------------------------------------------------------------
		 * Coolblue cookie dialog
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'button.js-cookie-settings',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('input[type="checkbox"][name="cookie_setting[]"]').forEach(check => check.checked = false);

				/* Save & exit. */
				setTimeout(_ => document.querySelector('button[name="accept_cookie"][value="selection"]')?.click(), 100);
			}
		);


		/* -----------------------------------------------------------------
		 * Kunstmaan Cookie Bar <https://github.com/Kunstmaan/KunstmaanCookieBundle>
		 * ----------------------------------------------------------------- */
		openAndWaitOrDoItNow(
			'.js-kmcc-extended-modal-button[data-target="legal_cookie_preferences"]',
			function () {
				/* Reject all possible cookies / object to all possible interests and personalization. */
				document.querySelectorAll('.kmcc-cookies-toggle-pp input[type="checkbox"]').forEach(check => check.checked = false);

				/* Save & exit. */
				document.querySelector('#kmcc-accept-some-cookies')?.click();
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
		 * DPG Media
		 * ----------------------------------------------------------------- */
		/* The personalization dialog is an IFRAME on a different (sub)domain, so this bookmarklet cannot access it. :-( *.


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
})();
