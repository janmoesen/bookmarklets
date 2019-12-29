/**
 * Search Yandex with its reverse image search.
 *
 * @title Yandex.Images
 */
(function yanimg() {
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
		s = getActiveSelection() || prompt('Please enter your Yandex.Images search query or image URL:');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection() + '$2');
	}

	if (s) {
		var words = s.split(' '), matches;

		/* If the first parameter looks like a URL, use Yandex’s reverse image search. */
		if (words[0].match(/^(\w+:(\/\/)?)?[^\s]+(\.[^\s]+)+\//))
		{
			location = 'https://yandex.com/images/search?rpt=imageview&url=' + encodeURIComponent(words[0]) + '&text=' + encodeURIComponent(words.slice(1).join(' '));
			return;
		}

		location = 'https://yandex.com/images/search?text=' + encodeURIComponent(s);
	}
})();
