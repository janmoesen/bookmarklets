/**
 * Look up the specified or selected text using Urban Dictionary.
 *
 * @title Urban Dictionary
 */
(function ud() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'http://www.urbandictionary.com/define.php?term=' + encodeURIComponent(s);
	}
})();
