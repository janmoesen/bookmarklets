/**
 * Search the international (English) Google for the given text, with a 100
 * results per SERP and without Instant Search.
 *
 * @title Google Search
 */
(function g() {
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
		location = 'https://www.google.com/search?as_qdr=all&ie=utf-8&hl=en&num=100&q=' + encodeURIComponent(s);
	}
})();
