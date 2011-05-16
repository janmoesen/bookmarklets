/**
 * Show the length of the given string.
 *
 * @title Show length
 */
(function len() {
	var maxLength = 64;
	var s = (<><![CDATA[%s]]></> + '') || getSelection() + '' || prompt('String?');
	prompt('The length of "' + (s.length > maxLength ? s.substring(0, maxLength / 2) + '…' + s.substring(s.length - maxLength / 2 + 1) : s) + '" is: ', s.length);
})();

