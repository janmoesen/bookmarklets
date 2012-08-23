/**
 * Search the international (English) Google for the given text, with a 100
 * results per SERP and without Instant Search.
 *
 * @title Google Search
 */
(function g() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'https://www.google.com/search?as_qdr=all&ie=utf-8&hl=en&num=100&q=' + encodeURIComponent(s);
	}
})();
