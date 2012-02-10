/**
 * Search Twitter for the specified text or URL.
 *
 * @title Twitter search
 */
(function tw() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your URL:', location);
	if (s) {
		location = 'https://twitter.com/search?q=' + encodeURIComponent(s);
	}
})();
