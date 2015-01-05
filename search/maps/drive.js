/**
 * Search Google Maps for a route by car.
 *
 * @title Google Maps (for cars)
 */
(function drive() {
	/* Try to get the parameter string from the bookmarklet/search query.
	   Fall back to the current text selection, if any. If those options
	   both fail, prompt the user.
	*/
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');
	if (s === '') {
		s = getSelection() + '' || prompt('Please enter your text:');
	}

	if (s) {
		if (s.match(/\sto[\s:]/) && !s.match(/^\s*from[\s:]/)) {
			s = 'from:' + s;
		}

		s = s.replace(/^\s*from\s+/g, 'from:');
		s = s.replace(/\s+to\s+/g, ' to:');
		location = 'https://maps.google.com/?doflg=ptk&dirflg=c&output=classic&q=' + encodeURIComponent(s)
			.replace(/%20/g, '+')
			.replace(/%3A/g, ':')
		;
	}
})();
