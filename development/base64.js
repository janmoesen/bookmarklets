/**
 * Convert plain text to Base64 and back. It determines which conversion to do.
 *
 * @title Base64
 */
(function b64() {
	var s = (<><![CDATA[%s]]></> + '').replace(/\u0025s/, '') || getSelection() + '' || prompt('Please enter your text:'), result, operation;
	if (s) {
		/* The try/catch block wraps the atob() call and the fake exception to force btoa(). */
		try {
			/* A string "looks like Base64" if it:
			 * - uses only the Base64 alphabet [A-Za-z0-9+/] (with optional trailing "=")
			 * - has at least one uppercase character followed by a lowercase character
			 *   (or the other way around) other than at the beginning of the string.
			 * This way, strings like "test" or "Hello", which are valid Base64 strings
			 * will not be decoded, since they most likely are not really Base64 encoded.
			 */
			if (!s.trim().match(/^[A-Za-z0-9+/]+([A-Z][a-z]|[a-z][A-Z])[A-Za-z0-9+/]*={0,2}$/)) {
				throw 'I guess this should be encoded, rather than encoded.';
			}
			s = s.trim();
			result = atob(s);
			operation = 'decoded';
		}
		catch (e) {
			result = btoa(s);
			operation = 'encoded';
		}
		open('data:text/plain;charset=UTF-8,' + encodeURIComponent('The Base64 ' + operation + ' string of "' + s + '" is:\n\n' + result));
	}
})();
