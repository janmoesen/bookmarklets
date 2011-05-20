/**
 * Translate the specified or selected text or URL to Spanish using Google.
 *
 * @title Translate to Spanish
 * @keyword 2es
 */
(function () {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || (location.protocol === 'file:' ? '' : location + '') || prompt('Please enter your text:');
	if (s) {
		location = s.match(/^(\w+:(\/\/)?)?[^\s]+(\.[^\s])+/)
			? 'http://translate.google.com/translate?sl=auto&tl=es&u=' + encodeURIComponent(s)
			: 'http://translate.google.com/translate_t#auto|es|' + encodeURIComponent(s);
	}
})();
