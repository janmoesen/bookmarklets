/**
 * Go to the first Google result ("I'm Feeling Lucky") for the given text.
 *
 * This used to be the default for "keyword.URL" in Firefox, but looks like it
 * is going to be removed: "738818 – consolidate Firefox search preferences":
 * https://bugzilla.mozilla.org/show_bug.cgi?id=738818
 *
 * @title Go
 */
(function go() {
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
		location = 'https://www.google.com/search?btnI&ie=utf-8&sourceid=navclient&q=' + encodeURIComponent(s);
	}
})();
