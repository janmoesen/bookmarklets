/**
 * Search YouTube for the specified or selected text.
 *
 * If the text looks like a video ID, you are taken directly to the video.
 *
 * If you append a "!" to the video ID, it will be opened in an IFRAME, so you
 * do not need to sign in for "restricted" videos.
 *
 * @title YouTube
 */
(function yt() {
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
		s = s.replace(/\uFEFF/g, '');
		var matches;
		if ((matches = s.match(/^([-_a-zA-Z0-9]{11})( *!)?$/)) && s.match(/[A-Z][a-z]|[a-z][A-Z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]/)) {
			if (matches[2]) {
				location = 'data:text/html;charset=UTF-8,'
					+ encodeURIComponent('<iframe width="854" height="510" src="http://www.youtube.com/embed/' + encodeURIComponent(matches[1]) + '"></iframe>');
			} else {
				location = 'http://www.youtube.com/watch?v=' + encodeURIComponent(s);
			}
		} else {
			location = 'http://www.youtube.com/results?search_query=' + encodeURIComponent(s);
		}
	}
})();
