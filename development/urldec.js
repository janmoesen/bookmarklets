/**
 * Decode all %XX bytes into a (hopefully) readable string.
 *
 * @title URL-decode
 */
(function urldec() {
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
		/* Try to open a data: URI. Firefox 57 and up (and probably other
		 * browsers) disallows scripts to open data: URIs, so as a fall-back,
		 * replace the original document's HTML with our generated text. */
		location = 'data:text/plain;charset=UTF-8,' + s;
		setTimeout(function () {
			document.open();
			document.write('<plaintext>' + decodeURIComponent(s));
			document.close();
		}, 250);
	}
})();
