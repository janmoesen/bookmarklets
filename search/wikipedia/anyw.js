/**
 * Look up the specified or selected text in any Wikipedia.
 *
 * This does a Google "I'm feeling lucky" search for all wikipedia.org sites.
 *
 * @title Any Wikipedia
 */
(function anyw() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		/* Pro-tip: use this as keyword.URL in Firefox (see about:config). It used to be the default, but then Google slightly tweaked it. */
		location = 'http://www.google.com/search?btnI=&ie=utf-8&sourceid=navclient&q=' + encodeURIComponent('site:wikipedia.org ' + s);
	}
})();
