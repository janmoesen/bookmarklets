/**
 * Translate the specified or selected text or URL to German using Google.
 *
 * @title Translate to German
 * @keyword 2de
 */
(function () {
	var s = (<><![CDATA[%s]]></> + '') || getSelection() + '' || location + '';
	if (s) {
		location = s.match(/^(\w+:(\/\/)?)?[^\s]+(\.[^\s])+/)
			? 'http://translate.google.com/translate?sl=auto&tl=de&u=' + encodeURIComponent(s)
			: 'http://translate.google.com/translate_t#auto|de|' + encodeURIComponent(s);
	}
})();
