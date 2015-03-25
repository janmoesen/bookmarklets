/**
 * Search Google Maps for a walking route.
 *
 * @title Google Maps (for pedestrians)
 */
(function walk() {
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
		s = s.replace(/^\s*from\s+/g, 'from:');
		s = s.replace(/\s+(to|–)\s+/g, ' to:');

		if (s.match(/\sto:/) && !s.match(/^\s*from:/)) {
			s = 'from:' + s;
		}

		location = 'https://maps.google.com/?doflg=ptk&dirflg=w&output=classic&q=' + encodeURIComponent(s)
			.replace(/%20/g, '+')
			.replace(/%3A/g, ':')
		;
	}
})();
