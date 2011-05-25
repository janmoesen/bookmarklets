/**
 * Look up the specified or selected text using German Wiktionary.
 *
 * @title German Wiktionary
 */
(function dewikt() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'http://de.wiktionary.org/wiki/' + encodeURIComponent(s);
	}
})();
