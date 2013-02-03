/**
 * View the Google cached text for the specified URL.
 * Specify "html" as the first parameter to view the cached HTML.
 *
 * @title Google cache
 */
(function gc() {
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
		var url = 'http://webcache.googleusercontent.com/search?', words = s.split(' ');

		if (words[0] == 'html') {
			s = words.slice(1).join(' ');
		} else {
			url += 'strip=1&';
		}

		location = url + 'q=cache:' + encodeURIComponent(s);
	}
})();
