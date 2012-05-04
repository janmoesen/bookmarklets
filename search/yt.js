/**
 * Search YouTube for the specified or selected text.
 *
 * @title YouTube
 */
(function yt() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'http://www.youtube.com/results?search_query=' + encodeURIComponent(s);
	}
})();
