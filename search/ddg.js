/**
 * Search DuckDuckGo for the given text, numbering the search result pages.
 *
 * @title DuckDuckGo
 */
(function ddg() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'https://duckduckgo.com/?kv=1&q=' + encodeURIComponent(s);
	}
})();
