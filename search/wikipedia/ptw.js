/**
 * Look up the specified or selected text in the Portuguese Wikipedia.
 *
 * Use `--dis` as the first parameter to show the disambiguation page, if any.
 *
 * E.g. `enw --dis 1` would open `1 (disambiguation)`, which is a lot faster to
 * type then `enw 1 (disambiguation)`, and also works for the non-English
 * Wikipedia instances, which use other words for “disambiguation”.
 *
 * @title Portuguese Wikipedia
 * @keyword ptw
 */
(function (config) {
	const {languageCode, languageNamesInEnglish, disambigationPageSuffix} = config;
	/* Try to get the parameter string from the bookmarklet/search query.
	   Fall back to the current text selection, if any. If those options
	   both fail, prompt the user.
	*/
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

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

	if (s === '') {
		s = getActiveSelection() || prompt(`Please enter the subject to look up in the ${languageNamesInEnglish.join('/')} Wikipedia:`);
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection() + '$2');
	}

	if (s) {
		/* Open the disambigation page for queries like `enw --dis Foo`. */
		let matches = s.match(/^\s*--dis\s*(.+)/);
		if (matches) {
			s = matches[1] + disambigationPageSuffix;
		}

		/* The Wikipedia search works like "I'm feeling lucky" on most Wikipedia instances. If there is a complete match, it will redirect us there. */
		location = `https://${languageCode}.wikipedia.org/w/index.php?searchToken=.&title=Special%3ASearch&ns0=1&search=${encodeURIComponent(s)}`;
	}
})({

	languageCode: 'pt',
	languageNamesInEnglish: ['Portuguese'],
	disambigationPageSuffix: ' (desambiguação)',

});
