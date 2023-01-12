/**
 * Translate the specified or selected text or URL to Russian.
 *
 * It determines what and how to translate using the following logic:
 * - If a parameter has been specified, translate that using Google Translate.
 * - If text has been selected, translate that using Google Translate.
 * - If the page appears to link to the Russian version of itself (e.g. in a
 *   language selector menu), follow that link.
 * - If the page is accessible via HTTP(S), use its URL with Google Translate.
 * - Otherwise, prompt the user for text to translate with Google Translate.
 *
 * @title Translate to Russian
 * @keyword 2ru
 */
(function () {
	/* Try to get the parameter string from the bookmarklet/search query. */
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	if (s === '') {
		/**
		 * Get the active text selection, diving into frames and
		 * text controls when necessary and possible.
		 */
		function getActiveSelection(doc) {
			if (arguments.length === 0) {
				doc = document;
			}

			if (!doc || typeof doc.getSelection !== 'function') {
				return '';
			}

			if (!doc.activeElement) {
				return doc.getSelection() + '';
			}

			var activeElement = doc.activeElement;

			/* Recurse for FRAMEs and IFRAMEs. */
			try {
				if (
					typeof activeElement.contentDocument === 'object'
					&& activeElement.contentDocument !== null
				) {
					return getActiveSelection(activeElement.contentDocument);
				}
			} catch (e) {
				return doc.getSelection() + '';
			}

			/* Get the selection from inside a text control. */
			if (typeof activeElement.value === 'string') {
				if (activeElement.selectionStart !== activeElement.selectionEnd) {
					return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
				}

				return activeElement.value;
			}

			/* Get the normal selection. */
			return doc.getSelection() + '';
		}

		s = getActiveSelection();

		if (!s) {
			/* If there is no selection, look for translation links. */
			var interLanguageSelectors = [
				/* Wikipedia/Mediawiki */
				'.interlanguage-link a[href][hreflang="ru"]',

				/* CatenaCycling.com */
				'#language a[href][hreflang="ru"]',

				/* Generic */
				'link[rel="alternate"][hreflang="ru"]',
				'link[rel="alternate"][hreflang^="ru-"]',
				'[id*="lang"][id*="elect"] a[hreflang="ru"]',
				'[id*="lang"][id*="elect"] a[hreflang^="ru-"]',
				'[class*="lang"][class*="elect"] a[hreflang="ru"]',
				'[class*="lang"][class*="elect"] a[hreflang^="ru-"]',
				'a.language[href*="/ru/"]',
				'a[class*="choose"][class*="lang"][href^="/ru/"]',
				'a[href][title$="this page in Russian"]',
				'a[href][title$="эта страница на русском языке"]'
			];

			for (var link, i = 0; i < interLanguageSelectors.length; i++) {
				link = document.querySelector(interLanguageSelectors[i]);

				if (link) {
					console.log('Translate to Russian: found link for selector ', interLanguageSelectors[i], ': ', link);

					location = link.href;

					return;
				}
			}

			var interLanguageXPathSelectors = [
				'//a[@href][translate(., "ABCÇDEFGHIJKLMNÑOPQRSTUVWXYZРУСКИЙ", "abcçdefghijklmnñopqrstuvwxyzруский") = "ru"]',
				'//a[@href][translate(., "ABCÇDEFGHIJKLMNÑOPQRSTUVWXYZРУСКИЙ", "abcçdefghijklmnñopqrstuvwxyzруский") = "русский"]',
				'//a[@href][contains(., "page in Russian")]',
			];

			for (i = 0; i < interLanguageXPathSelectors.length; i++) {
				var xPathResult = document.evaluate(interLanguageXPathSelectors[i], document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				if (xPathResult.snapshotLength) {
					console.log('Translate to Russian: found link for selector ', interLanguageXPathSelectors[i], ': ', xPathResult.snapshotItem(0));

					location = xPathResult.snapshotItem(0).href;

					return;
				}
			}

			/* Special case: if we are on a Wikimedia (e.g. Wikipedia or Wiktionary)
			 * page that does not exist, there are no interlanguage links. However,
			 * the page might still exist on a different language instance, so simply
			 * change the subdomain instead of falling back to Google Translate for
			 * the current URL.
			 */
			const wikimediaDomains = [
				'wikipedia.org',
				'wiktionary.org',
				'wikibooks.org',
				'wikinews.org',
				'wikiquote.org',
				'wikisource.org',
				'wikiversity.org',
				'wikivoyage.org',
			];

			const possibleWikimediaDomainMatches = location.host.match(/.*?\.(m\.)?([^.]+\.[^.]+$)/);
			if (possibleWikimediaDomainMatches) {
				const possibleWikimediaDomain = possibleWikimediaDomainMatches[2];
				if (wikimediaDomains.indexOf(possibleWikimediaDomain) > -1 && !document.querySelector('#ca-view')) {
					const mobileSubdomain = possibleWikimediaDomainMatches[1];
					const languageSubdomain = 'ru'.replace(/-.*/, '');
					const targetLanguageDomain = `${languageSubdomain}.${mobileSubdomain ?? ''}${possibleWikimediaDomain}`;
					console.log(`Translate to Russian: Wikimedia special case: going to the corresponding page on the Russian domain ${targetLanguageDomain}`);
					location.host = targetLanguageDomain;
					return;
				}
			}

			/* If we did not find a translation link, use the current URL if it is HTTP(S). (No point in sending data: or file: URLs to Google Translate.) */
			s = (location.protocol + '').match(/^http/)
				? location + ''
				: '';

			/* If all else fails, prompt the user for the text to translate. */
			if (!s) {
				s = prompt('Please enter your text to translate to Russian:');
			}
		}
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getSelection() + '$2');
	}

	if (s) {
		if (s.match(/^(https?:\/\/)([^\s.]+\.)+[^\s.]+\.?(\/\S*)?$/)) {
			const googleTranslateUrl = new URL(s);

			const isHttp = googleTranslateUrl.protocol === 'http:';
			googleTranslateUrl.protocol = 'https';

			googleTranslateUrl.host = googleTranslateUrl.host.replaceAll('-', '--').replaceAll('.', '-') + '.translate.goog';

			if (isHttp) {
				googleTranslateUrl.searchParams.set('_x_tr_sch', 'http');
			}

			googleTranslateUrl.searchParams.set('_x_tr_sl', 'auto');
			googleTranslateUrl.searchParams.set('_x_tr_tl', 'ru');

			location = googleTranslateUrl;
		} else {
			location = 'https://translate.google.com/?op=translate&sl=auto&tl=ru&text=' + encodeURIComponent(s);
		}
	}
})();
