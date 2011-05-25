/**
 * Look up the specified or selected text using Dutch Wiktionary.
 *
 * @title Dutch Wiktionary
 */
(function nlwikt() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'http://nl.wiktionary.org/wiki/' + encodeURIComponent(s);
	}
})();
