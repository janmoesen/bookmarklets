/**
 * Go to the first Google result ("I'm Feeling Lucky") for the given text.
 *
 * This used to be the default for "keyword.URL" in Firefox, but looks like it
 * is going to be removed: "738818 – consolidate Firefox search preferences":
 * https://bugzilla.mozilla.org/show_bug.cgi?id=738818
 *
 * @title Go
 */
(function go() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'https://www.google.com/search?btnI&ie=utf-8&sourceid=navclient&q=' + encodeURIComponent(s);
	}
})();
