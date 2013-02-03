/**
 * View the Internet Archive Wayback Machine's latest cache for the specified URL.
 *
 * @title Wayback Machine
 */
(function wb() {
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
	}

	if (s) {
		location = 'http://wayback.archive.org/web/' + s;
	}
})();
