/**
 * Change every character to its percent-encoded form (%XX), even if they are
 * URL-safe. (This makes "URL-encode" a bit of a misnomer.)
 *
 * I use this mainly for pranks. If I want to reply with a link to Google
 * Images, I will typically obfuscate the search term so as not to give it
 * away immediately. For example:
 * https://www.google.com/images?q=cool+story+bro
 * https://www.google.com/images?q=%63%6F%6F%6C%20%73%74%6F%72%79%20%62%72%6F
 *
 * @title URL-encode
 */
(function urlenc() {
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
		if (
			typeof activeElement.value === 'string'
			&& activeElement.selectionStart !== activeElement.selectionEnd
		) {
			return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
		}

		/* Get the normal selection. */
		return doc.getSelection() + '';
	}

	if (s === '') {
		s = getActiveSelection() || prompt('Please enter the text to URL-encode:');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection() + '$2');
	}

	if (s) {
		s = s.split('').map(function (c) {
			return '%' + c.charCodeAt(0).toString(16);
		}).join('').toUpperCase();

		/* Try to open a data: URI. Firefox 57 and up (and probably other
		 * browsers) disallows scripts to open data: URIs, so as a fall-back,
		 * replace the original document's HTML with our generated text. */
		location = 'data:text/plain;charset=UTF-8,' + encodeURIComponent(s);
		setTimeout(function () {
			HTMLDocument.prototype.open.call(document);
			HTMLDocument.prototype.write.call(document, '<plaintext>' + s);
			HTMLDocument.prototype.close.call(document);
		}, 250);
	}
})();
