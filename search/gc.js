/**
 * View the Google cached text for the specified URL.
 * Specify "html" as the first parameter to view the cached HTML.
 *
 * @title Google cache
 */
(function gc() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your URL:', location);
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
