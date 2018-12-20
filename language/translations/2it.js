/**
 * Translate the specified or selected text or URL to Italian.
 *
 * It determines what and how to translate using the following logic:
 * - If a parameter has been specified, translate that using Google Translate.
 * - If text has been selected, translate that using Google Translate.
 * - If the page appears to link to the Italian version of itself (e.g. in a
 *   language selector menu), follow that link.
 * - If the page is accessible via HTTP(S), use its URL with Google Translate.
 * - Otherwise, prompt the user for text to translate with Google Translate.
 *
 * @title Translate to Italian
 * @keyword 2it
 */
(function () {
	/* Create a new IFRAME to get a "clean" Window object, so we can use its
	 * console. Sometimes sites (e.g. Twitter) override console.log and even
	 * the entire console object. "delete console.log" or "delete console"
	 * does not always work, and messing with the prototype seemed more
	 * brittle than this. */
	var console = (function () {
		var iframe = document.getElementById('xxxJanConsole');
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
			if (
				typeof activeElement.value === 'string'
				&& activeElement.selectionStart !== activeElement.selectionEnd
			) {
				return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
			}

			/* Get the normal selection. */
			return doc.getSelection() + '';
		}

		s = getActiveSelection();

		if (!s) {
			/* If there is no selection, look for translation links. */
			var interLanguageSelectors = [
				/* Wikipedia/Mediawiki */
				'.interlanguage-link a[href][hreflang="it"]',

				/* CatenaCycling.com */
				'#language a[href][hreflang="it"]',

				/* Generic */
				'link[rel="alternate"][hreflang="it"]',
				'link[rel="alternate"][hreflang^="it-"]',
				'[id*="lang"][id*="elect"] a[hreflang="it"]',
				'[id*="lang"][id*="elect"] a[hreflang^="it-"]',
				'[class*="lang"][class*="elect"] a[hreflang="it"]',
				'[class*="lang"][class*="elect"] a[hreflang^="it-"]',
				'a.language[href*="/it/"]',
				'a[href][title$="this page in Italian"]',
				'a[href][title$="questa pagina in italiano"]'
			];

			for (var link, i = 0; i < interLanguageSelectors.length; i++) {
				link = document.querySelector(interLanguageSelectors[i]);

				if (link) {
					console.log('Translate to Italian: found link for selector ', interLanguageSelectors[i], ': ', link);

					location = link.href;

					return;
				}
			}

			var interLanguageXPathSelectors = [
				'//a[@href][translate(., "ABCÇDEFGHIJKLMNÑOPQRSTUVWXYZ", "abcçdefghijklmnñopqrstuvwxyz") = "it"]',
				'//a[@href][translate(., "ABCÇDEFGHIJKLMNÑOPQRSTUVWXYZ", "abcçdefghijklmnñopqrstuvwxyz") = "italiano"]',
				'//a[@href][contains(., "page in Italian")]',
			];

			for (i = 0; i < interLanguageXPathSelectors.length; i++) {
				var xPathResult = document.evaluate(interLanguageXPathSelectors[i], document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				if (xPathResult.snapshotLength) {
					console.log('Translate to Italian: found link for selector ', interLanguageXPathSelectors[i], ': ', xPathResult.snapshotItem(0));

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
				s = prompt('Please enter your text to translate to Italian:');
			}
		}
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getSelection() + '$2');
	}

	if (s) {
		if (s.match(/^(https?:\/\/)([^\s.]+\.)+[^\s.]+\.?(\/\S*)?$/)) {
			location = 'https://translate.google.com/translate?sl=auto&tl=it&u=' + encodeURIComponent(s);
		} else {
			location = 'https://translate.google.com/translate_t#auto|it|' + encodeURIComponent(s);
		}
	}
})();
