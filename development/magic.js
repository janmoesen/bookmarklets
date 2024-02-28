/**
 * Use GCHQ’s CyberChef to magically determine what the input data is, e.g.
 * a Base64-encoded string of gzipped plaintext, a JSON Web Token, …
 *
 * By default, this bookmarklet tells CyberChef to only go two levels deep to
 * save time and energy.
 *
 * E.g. `magic H4sIAL8d32UAAyvJSFXIL8pMz8xLzFEoyEnMzCtJrSjRAwByt2jzFwAAAA`
 * will use CyberChef to produce this recipe:
 *   1) `From_Base64('A-Za-z0-9+/=',true,false)`
 *   2) `Gunzip()`
 * which leads to: `the original plaintext.`
 *
 * @title CyberChef Magic
 */
(function magic(document) {
	'use strict';

	/* Try to get the parameter string from the bookmarklet/search query.
	 * Fall back to the current text selection, if any. If those options
	 * both fail, prompt the user. */
	let s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	/**
	 * Get the active text selection, diving into frames and
	 * text controls when necessary and possible.
	 */
	function getActiveSelection(document) {
		if (!document || typeof document.getSelection !== 'function') {
			return '';
		}

		if (!document.activeElement) {
			return document.getSelection() + '';
		}

		const activeElement = document.activeElement;

		/* Recurse for FRAMEs and IFRAMEs. */
		try {
			if (
				typeof activeElement.contentDocument === 'object'
				&& activeElement.contentDocument !== null
			) {
				return getActiveSelection(activeElement.contentDocument);
			}
		} catch (e) {
			return document.getSelection() + '';
		}

		/* Get the selection from inside a text control. */
		if (typeof activeElement.value === 'string') {
			if (activeElement.selectionStart !== activeElement.selectionEnd) {
				return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
			}

			return activeElement.value;
		}

		/* Get the normal selection. */
		return document.getSelection() + '';
	}

	if (s === '') {
		s = getActiveSelection(document) || prompt('Please enter your input data for CyberChef’s magic mode:');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection(document) + '$2');
	}

	if (s) {
		location = 'https://gchq.github.io/CyberChef/#recipe=Magic(2,false,false,%27%27)&input=' + encodeURIComponent(btoa(s).replace(/=*$/, ''));
	}
})(document);
