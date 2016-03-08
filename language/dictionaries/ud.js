/**
 * Look up the specified or selected text using Urban Dictionary.
 *
 * @title Urban Dictionary
 */
(function ud() {
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
		s = s.replace(/(^|\s)~(\s|$)/g, '$1' + getSelection() + '$2');
	}

	if (s) {
		location = 'http://www.urbandictionary.com/define.php?term=' + encodeURIComponent(s);
	}
})();
