/**
 * Go to the first DuckDuckGo result ("I'm Feeling Ducky") for the given text.
 *
 * @title DuckDuckGoNow
 */
(function ddgo() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'https://duckduckgo.com/?q=' + encodeURIComponent('\\' + s);
	}
})();
