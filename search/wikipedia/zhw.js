/**
 * Look up the specified or selected text in the Simplified Chinese Wikipedia.
 *
 * @title Simplified Chinese Wikipedia
 */
(function zhw() {
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
		/* The Wikipedia search works like "I'm feeling lucky" on most Wikipedia instances. If there is a complete match, it will redirect us there. */
		location = 'https://zh.wikipedia.org/w/index.php?searchToken=&title=Special%3ASearch&search=' + encodeURIComponent(s);
	}
})();
