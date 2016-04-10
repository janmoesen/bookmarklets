/**
 * Look up the specified or selected text in any Wikipedia.
 *
 * This does a Google "I'm feeling lucky" search for all wikipedia.org sites.
 *
 * @title Any Wikipedia
 */
(function anyw() {
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
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getSelection() + '$2');
	}

	if (s) {
		/* Pro-tip: use this as keyword.URL in Firefox (see about:config). It used to be the default, but then Google slightly tweaked it. */
		location = 'https://www.google.com/search?btnI=&ie=utf-8&sourceid=navclient&q=' + encodeURIComponent('site:wikipedia.org ' + s);
	}
})();
