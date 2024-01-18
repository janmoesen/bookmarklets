/**
 * Translate the specified or selected text or URL to Portuguese.
 *
 * It determines what and how to translate using the following logic:
 * - If a parameter has been specified, translate that using Google Translate.
 * - If text has been selected, translate that using Google Translate.
 * - If the page appears to link to the Portuguese version of itself (e.g. in a
 *   language selector menu), follow that link.
 * - If the page is accessible via HTTP(S), use its URL with Google Translate.
 * - Otherwise, prompt the user for text to translate with Google Translate.
 *
 * @title Translate to Portuguese
 * @keyword 2pt
 */
(function (config) {
	const {keyword, languageCodes, languageNamesInEnglish, languageNativeNames, thisPageInNativeNameTexts} = config;

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
			const interLanguageSelectors = [];

			languageCodes.forEach(languageCode => interLanguageSelectors.push(
				/* Wikipedia/Mediawiki */
				`.interlanguage-link a[href][hreflang="${languageCode}"]`,

				/* CatenaCycling.com */
				`#language a[href][hreflang="${languageCode}"]`,

				/* Generic */
				`link[rel="alternate"][hreflang="${languageCode}"]`,
				`link[rel="alternate"][hreflang^="${languageCode}-"]`,
				`[id*="lang"][id*="elect"] a[hreflang="${languageCode}"]`,
				`[id*="lang"][id*="elect"] a[hreflang^="${languageCode}-"]`,
				`[class*="lang"][class*="elect"] a[hreflang="${languageCode}"]`,
				`[class*="lang"][class*="elect"] a[hreflang^="${languageCode}-"]`,
				`a.language[href*="/${languageCode}/"]`,
				`a.language[href*="/${languageCode.toLowerCase()}/"]`,
				`a[class*="choose"][class*="lang"][href^="/${languageCode}/"]`,
				`a[class*="choose"][class*="lang"][href^="/${languageCode.toLowerCase()}/"]`,
			));

			languageNamesInEnglish.forEach(languageNameInEnglish => interLanguageSelectors.push(
				`a[href][title$="this page in ${languageNameInEnglish}"]`,
				`a[href][title$="current page in ${languageNameInEnglish}"]`
			));

			thisPageInNativeNameTexts.forEach(thisPageInNativeNameText => interLanguageSelectors.push(
				`a[href][title$="${thisPageInNativeNameText}"]`,
			));

			for (var link, i = 0; i < interLanguageSelectors.length; i++) {
				link = document.querySelector(interLanguageSelectors[i]);

				if (link) {
					console.log(`${keyword}: found link for selector ${interLanguageSelectors[i]}: `, link);

					location = link.href;

					return;
				}
			}

			const interLanguageXPathSelectors = [];

			languageCodes.forEach(languageCode => interLanguageSelectors.push(
				`//a[@href][translate(., "ABCÇDEFGHIJKLMNÑOPQRSTUVWXYZРУСКИЙ", "abcçdefghijklmnñopqrstuvwxyzруский") = "${languageCode}"]`,
			));

			languageNamesInEnglish.forEach(languageNameInEnglish => interLanguageSelectors.push(
				`//a[@href][translate(., "ABCÇDEFGHIJKLMNÑOPQRSTUVWXYZРУСКИЙ", "abcçdefghijklmnñopqrstuvwxyzруский") = "${languageNameInEnglish.toLowerCase()}"]`,
			));

			languageNativeNames.forEach(languageNativeName => interLanguageSelectors.push(
				`//a[@href][translate(., "ABCÇDEFGHIJKLMNÑOPQRSTUVWXYZРУСКИЙ", "abcçdefghijklmnñopqrstuvwxyzруский") = "${languageNativeName.toLowerCase()}"]`,
			));

			thisPageInNativeNameTexts.forEach(thisPageInNativeNameText => interLanguageSelectors.push(
				`//a[@href][contains(., "${thisPageInNativeNameText}")]`,
			));

			for (i = 0; i < interLanguageXPathSelectors.length; i++) {
				var xPathResult = document.evaluate(interLanguageXPathSelectors[i], document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				if (xPathResult.snapshotLength) {
					console.log(`${keyword}: found link for selector ${interLanguageXPathSelectors[i]}: `, xPathResult.snapshotItem(0));

					location = xPathResult.snapshotItem(0).href;

					return;
				}
			}

			/* If we are on a special Wikimedia page (e.g. a 404, search results, a
			 * user talk page on Wikipedia or Wiktionary), there are no interlanguage
			 * links. However, the page might still exist on a different language
			 * instance, so go to that instance, translating the special page name if
			 * necessary. */
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
				if (wikimediaDomains.indexOf(possibleWikimediaDomain) > -1) {
					const mobileSubdomain = possibleWikimediaDomainMatches[1];
					const targetLanguageDomain = `${languageCodes[0]}.${mobileSubdomain ?? ''}${possibleWikimediaDomain}`;

					let urlForOtherLanguage = new URL(location);
					urlForOtherLanguage.hostname = targetLanguageDomain;

					/* Special pages like search or user talk have localised names,
					 * so use the canonical (non-localised) name on the other language’s
					 * wiki. That wiki will then redirect to the localised name. */
					const allHtml = document.documentElement.outerHTML;
					let wgCanonicalNamespace = JSON.parse(allHtml.match(/"wgCanonicalNamespace"\s*:\s*(?<jsonValue>"[^"]+")/)?.groups.jsonValue ?? 'null');
					if (wgCanonicalNamespace) {
						let wgCanonicalSpecialPageName = JSON.parse(allHtml.match(/"wgCanonicalSpecialPageName"\s*:\s*(?<jsonValue>"[^"]+")/)?.groups.jsonValue ?? 'null');
						let wgPageName = JSON.parse(allHtml.match(/"wgPageName"\s*:\s*(?<jsonValue>"[^"]+")/)?.groups.jsonValue ?? 'null');

						const newPageName = wgCanonicalSpecialPageName
							? wgPageName.replace(/^[^:]+:[^\/]+/, `${wgCanonicalNamespace}:${wgCanonicalSpecialPageName}`)
							: wgPageName.replace(/^[^:/]+/, wgCanonicalNamespace);

						urlForOtherLanguage.pathname = urlForOtherLanguage.pathname.replace(wgPageName, newPageName);
						if (urlForOtherLanguage.searchParams.has('title')) {
							urlForOtherLanguage.searchParams.set('title', urlForOtherLanguage.searchParams.get('title').replace(wgPageName, newPageName));
						}
					}

					console.log(`${keyword}: Wikimedia special case: going to the corresponding page on the ${languageNamesInEnglish.join('/')} domain ${targetLanguageDomain}: ${urlForOtherLanguage}`);
					location = urlForOtherLanguage;
					return;
				}
			}

			/* If we did not find a translation link, use the current URL if it is HTTP(S). (No point in sending data: or file: URLs to Google Translate.) */
			s = (location.protocol + '').match(/^http/)
				? location + ''
				: '';

			/* If all else fails, prompt the user for the text to translate. */
			if (!s) {
				s = prompt(`Please enter your text to translate to ${languageNamesInEnglish.join('/')}:`);
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
			googleTranslateUrl.searchParams.set('_x_tr_tl', languageCodes[0]);

			location = googleTranslateUrl;
		} else {
			location = `https://translate.google.com/?op=translate&sl=auto&tl=${languageCodes[0]}&text=${encodeURIComponent(s)}`;
		}
	}
})({

	keyword: '2pt',
	languageCodes: ['pt', 'pt-PT', 'pt-BR'],
	languageNamesInEnglish: ['Portuguese'],
	languageNativeNames: ['português'],
	thisPageInNativeNameTexts: ['esta página em português', 'este site em português', 'versão em português'],

});
