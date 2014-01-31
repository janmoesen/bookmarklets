/**
 * Translate the specified or selected text or URL to German using Google.
 *
 * @title Translate to German
 * @keyword 2de
 */
(function () {
	/* Try to get the parameter string from the bookmarklet/search query.
	   Fall back to the current text selection, if any. If those options both
	   fail, use the current location, unless it is a local file. In the case
	   of local files, prompt the user for the text.
	 */
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');
	if (s === '') {
		s = getSelection() + ''
			|| (location.protocol === 'file:' ? '' : location + '')
			|| prompt('Please enter your text:');
	}

	if (s) {
		if (s.match(/^(\w+:(\/\/)?)?[^\s.]+(\.[^\s])+/)) {
			var protocol = (s.match(/^https:/))
				? 'https'
				: 'http';
			location = protocol + '://translate.google.com/translate?sl=auto&tl=de&u=' + encodeURIComponent(s);
		} else {
			location = 'https://translate.google.com/translate_t#auto|de|' + encodeURIComponent(s);
		}
	}
})();
