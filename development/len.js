/**
 * Show the length of the given string.
 *
 * @title Show length
 */
(function len() {
	/* Try to get the parameter string from the bookmarklet/search query.
	   Fall back to the current text selection, if any. If those options
	   both fail, prompt the user.
	*/
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	/**
	 * Get the active text selection, diving into frames and
	 * text controls when necessary and possible.
	 */
	function getActiveSelection(doc) {
		if (arguments.length === 0) {
			doc = document;
		}

		if (!doc || typeof doc.getSelection !== 'function') {
			return '';
		}

		if (!doc.activeElement) {
			return doc.getSelection() + '';
		}

		var activeElement = doc.activeElement;

		/* Recurse for FRAMEs and IFRAMEs. */
		try {
			if (
				typeof activeElement.contentDocument === 'object'
				&& activeElement.contentDocument !== null
			) {
				return getActiveSelection(activeElement.contentDocument);
			}
		} catch (e) {
			return doc.getSelection() + '';
		}

		/* Get the selection from inside a text control. */
		if (typeof activeElement.value === 'string') {
			if (activeElement.selectionStart !== activeElement.selectionEnd) {
				return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
			}

			return activeElement.value;
		}

		/* Get the normal selection. */
		return doc.getSelection() + '';
	}

	if (s === '') {
		s = getActiveSelection() || prompt('Please enter your string to measure:');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection() + '$2');
	}

	if (s) {
		/* To count the number of characters, we cannot rely on String.length
		 * because of astral chars. Use this code from BestieJS to deal with
		 * those:
		 * https://github.com/bestiejs/punycode.js/blob/8164242ef1/punycode.js#L99-126
		 */
		var codePoints = [], counter = 0, length = s.length, value, extra;
		while (counter < length) {
			value = s.charCodeAt(counter++);
			if ((value & 0xF800) === 0xD800) {
				extra = s.charCodeAt(counter++);
				if ((value & 0xFC00) != 0xD800 || (extra & 0xFC00) != 0xDC00) {
					alert('Illegal UTF-16 sequence, but continuing anyway.');
				}
				value = ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
			}
			codePoints.push(value);
		}
		var numChars = codePoints.length;

		/* To count the number of bytes, we URL-encode the string so the
		 * non-ASCII characters are encoded as sequences of %XX. We then
		 * replace those triplets by a single character, "x", and count the
		 * number of characters in the resulting string.
		 */
		var numBytes = encodeURI(s).replace(/%../g, 'x').length;

		/* Shorten the string before displaying, if necessary. */
		var maxDisplayLength = 64;
		if (numChars > maxDisplayLength) {
			var encodeUtf16 = function (value) {
				var output = '';
				if ((value & 0xF800) == 0xD800) {
					alert('Invalid UTF-16 value, but continuing anyway.');
				}
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += String.fromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += String.fromCharCode(value);
				return output;
			};
			s = codePoints.slice(0, maxDisplayLength / 2).map(encodeUtf16).join('')
				+ '…'
				+ codePoints.slice(numChars - maxDisplayLength / 2 + 1).map(encodeUtf16).join('');
		}

		var displayString = numChars === numBytes
			? 'The number of characters in the ASCII string "' + s + '" is: '
			: 'The number of characters in the non-ASCII string "' + s + '" (' + numBytes + ' UTF-8 bytes) is: ';
		prompt(displayString, numChars);
	}
})();
