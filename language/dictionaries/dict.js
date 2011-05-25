/**
 * Look up the specified or selected text using Dictionary.com.
 *
 * @title Dictionary.com
 */
(function dict() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:');
	if (s) {
		location = 'http://dictionary.reference.com/browse/' + encodeURIComponent(s);
	}
})();
