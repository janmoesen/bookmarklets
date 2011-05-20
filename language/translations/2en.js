/**
 * Translate the specified or selected text or URL to English using Google.
 *
 * @title Translate to English
 * @keyword 2en
 */
(function () {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || (location.protocol === 'file:' ? '' : location + '') || prompt('Please enter your text:');
	if (s) {
		location = s.match(/^(\w+:(\/\/)?)?[^\s]+(\.[^\s])+/)
			? 'http://translate.google.com/translate?sl=auto&tl=en&u=' + encodeURIComponent(s)
			: 'http://translate.google.com/translate_t#auto|en|' + encodeURIComponent(s);
	}
})();
