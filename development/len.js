/**
 * Show the length of the given string.
 *
 * @title Show length
 */
(function len() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('String?');
	if (s) {
		/* To count the number of characters, we cannot rely on String.length
		 * because of astral chars. Use this code from BestieJS to deal with
		 * those:
		 * https://github.com/bestiejs/punycode.js/blob/8164242ef1/punycode.js#L99-126
		 */
		var realLength = 0, counter = 0, length = s.length, value, extra;
		while (counter < length) {
			value = s.charCodeAt(counter++);
			if ((value & 0xF800) == 0xD800) {
				extra = s.charCodeAt(counter++);
				if ((value & 0xFC00) != 0xD800 || (extra & 0xFC00) != 0xDC00) {
					alert('Illegal UTF-16 sequence, but continuing anyway.');
				}
				value = ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
			}
			realLength++;
		}

		/* To count the number of bytes, we URL-encode the string so the
		 * non-ASCII characters are encoded as sequences of %XX. We then
		 * replace those triplets by a single character, "x", and count the
		 * number of characters in the resulting string.
		 */
		var numBytes = encodeURI(s).replace(/%../g, 'x').length;

		var maxDisplayLength = 64;
		var displayString = realLength > maxDisplayLength
			? s.substring(0, maxDisplayLength / 2) + '…' + s.substring(realLength - maxDisplayLength / 2 + 1)
			: s;
		displayString = realLength === numBytes
			? 'The number of characters in the ASCII string "' + displayString + '" is: '
			: 'The number of characters in the non-ASCII string "' + displayString + '" (' + numBytes + ' bytes) is: ';
		prompt(displayString, realLength);
	}
})();
