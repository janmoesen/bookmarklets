/**
 * Look up the specified or selected text using English Wiktionary.
 *
 * @title English Wiktionary
 */
(function enwikt() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'http://en.wiktionary.org/wiki/' + encodeURIComponent(s);
	}
})();
