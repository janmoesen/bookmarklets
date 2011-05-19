javascript:
/**
 * Translate the specified or selected text to French using Google.
 *
 * @title Translate to French
 * @keyword 2fr
 */
(function () {
	var s = (<><![CDATA[%s]]></> + '') || getSelection() + '' || location + '';
	if (s) {
		location = s.match(/^(\w+:(\/\/)?)?[^\s]+(\.[^\s])+/)
			? 'http://translate.google.com/translate?sl=auto&tl=fr&u=' + encodeURIComponent(s)
			: 'http://translate.google.com/translate_t#auto|fr|' + encodeURIComponent(s);
	}
})();
