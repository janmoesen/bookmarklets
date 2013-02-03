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
	}

	if (s) {
		location = 'data:text/html;charset=UTF-8,' + encodeURIComponent(s);
	}
})();
