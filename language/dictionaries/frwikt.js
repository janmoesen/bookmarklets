/**
 * Look up the specified or selected text using French Wiktionary.
 *
 * @title French Wiktionary
 */
(function frwikt() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'http://fr.wiktionary.org/wiki/' + encodeURIComponent(s);
	}
})();
