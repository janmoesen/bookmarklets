/**
 * Translate the specified or selected text or URL to French using Google.
 *
 * @title Translate to French
 * @keyword 2fr
 */
(function () {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || (location.protocol === 'file:' ? '' : location + '') || prompt('Please enter your text:');
	if (s) {
		location = s.match(/^(\w+:(\/\/)?)?[^\s.]+(\.[^\s])+/)
			? 'http://translate.google.com/translate?sl=auto&tl=fr&u=' + encodeURIComponent(s)
			: 'http://translate.google.com/translate_t#auto|fr|' + encodeURIComponent(s);
	}
})();
