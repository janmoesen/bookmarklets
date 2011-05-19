/**
 * Render the specified or selected text as HTML.
 *
 * @title View as HTML
 */
(function html() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your HTML snippet:');
	if (s) {
		location = 'data:text/html;charset=UTF-8,' + encodeURIComponent(s);
	}
})();
