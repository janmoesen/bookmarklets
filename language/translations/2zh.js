/**
 * Translate the specified or selected text or URL to Simplified Chinese.
 *
 * It determines what and how to translate using the following logic:
 * - If a parameter has been specified, translate that using Google Translate.
 * - If text has been selected, translate that using Google Translate.
 * - If the page appears to link to the Simplified Chinese version of itself (e.g. in a
 *   language selector menu), follow that link.
 * - If the page is accessible via HTTP(S), use its URL with Google Translate.
 * - Otherwise, prompt the user for text to translate with Google Translate.
 *
 * @title Translate to Simplified Chinese
 * @keyword 2zh
 */
(function () {
	/* Try to get the parameter string from the bookmarklet/search query. */
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	if (s === '') {
		/* If there is no parameter, see if there is text selected. */
		s = getSelection() + '';

		if (!s) {
			/* If there is no selection, look for translation links. */
			var interLanguageSelectors = [
				/* Wikipedia/Mediawiki */
				'.interlanguage-link a[href][hreflang="zh-CN"]',

				/* CatenaCycling.com */
				'#language a[href][hreflang="zh-CN"]',

				/* developer.mozilla.org */
				'#translations a[rel="internal"][href^="/zh-CN/"]',
				'#translations a[rel="internal"][href^="/zh-CN-"]',

				/* Generic */
				'[id*="lang"][id*="elect"] a[hreflang="zh-CN"]',
				'[class*="lang"][class*="elect"] a[hreflang="zh-CN"]',
				'a[href][title$="this page in Simplified Chinese"]',
				'a[href][title$="this page in Chinese"]'
			];

			for (var link, i = 0; i < interLanguageSelectors.length; i++) {
				link = document.querySelector(interLanguageSelectors[i]);

				if (link) {
					if (window.console && console.log) {
						console.log('Translate to Simplified Chinese: found link for selector ', interLanguageSelectors[i], ': ', link);
					}

					location = link.href;

					return;
				}
			}

			var interLanguageXPathSelectors = [
				'//a[@href][translate(., "ABCÇDEFGHIJKLMNÑOPQRSTUVWXYZ", "abcçdefghijklmnñopqrstuvwxyz") = "zh-CN"]',
				'//a[@href][translate(., "ABCÇDEFGHIJKLMNÑOPQRSTUVWXYZ", "abcçdefghijklmnñopqrstuvwxyz") = "中文"]',
				'//a[@href][contains(., "page in Simplified Chinese")]',
			];

			for (i = 0; i < interLanguageXPathSelectors.length; i++) {
				var xPathResult = document.evaluate(interLanguageXPathSelectors[i], document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				if (xPathResult.snapshotLength) {
					if (window.console && console.log) {
						console.log('Translate to Simplified Chinese: found link for selector ', interLanguageXPathSelectors[i], ': ', xPathResult.snapshotItem(0));
					}

					location = xPathResult.snapshotItem(0).href;

					return;
				}
			}

			/* If we did not find a translation link, use the current URL if it is HTTP(S). (No point in sending data: or file: URLs to Google Translate.) */
			s = (location.protocol + '').match(/^http/)
				? location + ''
				: '';

			/* If all else fails, prompt the user for the text to translate. */
			if (!s) {
				s = prompt('Please enter your text:');
			}
		}
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getSelection() + '$2');
	}

	if (s) {
		if (s.match(/^(\w+:(\/\/)?)?[^\s.]+(\.[^\s])+/)) {
			var protocol = (s.match(/^https:/))
				? 'https'
				: 'http';
			location = protocol + '://translate.google.com/translate?sl=auto&tl=zh-CN&u=' + encodeURIComponent(s);
		} else {
			location = 'https://translate.google.com/translate_t#auto|zh-CN|' + encodeURIComponent(s);
		}
	}
})();
