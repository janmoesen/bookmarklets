/**
 * Render the specified or selected text as HTML.
 *
 * @title View as HTML
 */
(function html() {
	/* Try to get the parameter string from the bookmarklet/search query.
	   Fall back to the current text selection, if any. If those options
	   both fail, prompt the user.
	*/
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');
	if (s === '') {
		s = getSelection() + '' || prompt('Please enter your HTML snippet:');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getSelection() + '$2');
	}

	if (s) {
		/* Try to open a data: URI. Firefox 57 and up (and probably other
		 * browsers) disallows scripts to open data: URIs, so as a fall-back,
		 * replace the original document's HTML with our generated HTML. */
		location = 'data:text/html;charset=UTF-8,' + encodeURIComponent(s);
		setTimeout(function () {
			HTMLDocument.prototype.open.call(document);
			HTMLDocument.prototype.write.call(document, s);
			HTMLDocument.prototype.close.call(document);
		}, 250);
	}
})();
