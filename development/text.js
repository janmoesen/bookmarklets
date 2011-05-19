/**
 * Render the specified or selected text as plain text.
 *
 * @title View as text
 */
(function text() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text snippet:');
	if (s) {
		location = 'data:text/plain;charset=UTF-8,' + encodeURIComponent(s);
	}
})();
