/**
 * Go to the specified or selected URL using the current page as the referrer.
 *
 * @title Surf with referrer
 */
(function refer() {
	/* Try to get the parameter string from the bookmarklet/search query.
	   Fall back to the current text selection, if any. If those options
	   both fail, prompt the user.
	*/
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');
	if (s === '') {
		s = getSelection() + '' || prompt('Please enter the destination URL:', location);
	} else {
		s = s.replace(/(^|\s)~(\s|$)/g, '$1' + getSelection() + '$2');
	}

	if (s) {
		location = s;
	}
})();
