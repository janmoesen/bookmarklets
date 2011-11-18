/**
 * Show the length of the given string.
 *
 * @title Show length
 */
(function len() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('String?');
	if (s) {
		var maxDisplayLength = 64;
		var displayString = s.length > maxDisplayLength
			? s.substring(0, maxDisplayLength / 2) + '…' + s.substring(s.length - maxDisplayLength / 2 + 1)
			: s;
		/* To count the number of bytes, we replace all ASCII characters by a
		 * URL-safe "a". If we URL-encode the resulting string, we get all
		 * non-ASCII characters encoded as sequences of %XX. We then replace
		 * those triplets by a single character, "b", and count the
		 * characters in the "aaabbbaaaa" string.
		 */
		var numBytes = encodeURIComponent(s.replace(/[\x00-\x7F]/g, 'a')).replace(/%[0-9A-Fa-f]{2}/g, 'b').length;

		displayString = s.length === numBytes
			? 'The number of characters in the ASCII string "' + displayString + '" is: '
			: 'The number of characters in the non-ASCII string "' + displayString + '" (' + numBytes + ' bytes) is: ';
		prompt(displayString, s.length);
	}
})();
