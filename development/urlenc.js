/**
 * Change every character to its percent-encoded form (%XX), even if they are
 * URL-safe. (This makes "URL-encode" a bit of a misnomer.)
 *
 * I use this mainly for pranks. If I want to reply with a link to Google
 * Images, I will typically obfuscate the search term so as not to give it
 * away immediately. For example:
 * https://www.google.com/images?q=cool+story+bro
 * https://www.google.com/images?q=%63%6F%6F%6C%20%73%74%6F%72%79%20%62%72%6F
 *
 * @title URL-encode
 */
(function urlenc() {
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
		s = s.split('').map(function (c) {
			return '%' + c.charCodeAt(0).toString(16);
		}).join('').toUpperCase();

		/* Try to open a data: URI. Firefox 57 and up (and probably other
		 * browsers) disallows scripts to open data: URIs, so as a fall-back,
		 * replace the original document's HTML with our generated text. */
		location = 'data:text/plain;charset=UTF-8,' + encodeURIComponent(s);
		setTimeout(function () {
			document.open();
			document.write('<plaintext>' + s);
			document.close();
		}, 250);
	}
})();
