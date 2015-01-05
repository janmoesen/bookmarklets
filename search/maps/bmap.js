/**
 * Search Bing Maps.
 *
 * @title Bing Maps
 */
(function bmap() {
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
		location = 'https://www.bing.com/maps/?obox=1&q=' + encodeURIComponent(s)
			.replace(/%20/g, '+')
			.replace(/%3A/g, ':')
		;
	}
})();
