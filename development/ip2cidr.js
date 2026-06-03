/**
 * Use the NetYogi IP to CIDR converter to get a `address/mask` netblock notation.
 *
 * @title IP-to-CIDR
 */
(function ip2cidr() {
	'use strict';

	/* Try to get the parameter string from the bookmarklet/search query.
	 * Fall back to the current text selection, if any. If those options
	 * both fail, prompt the user. */
	let s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	/**
	 * Get the active text selection, diving into frames and
	 * text controls when necessary and possible.
	 */
	function getActiveSelection(document) {
		if (!document || typeof document.getSelection !== 'function') {
			return '';
		}

		if (!document.activeElement) {
			return document.getSelection() + '';
		}

		const activeElement = document.activeElement;

		/* Recurse for FRAMEs and IFRAMEs. */
		try {
			if (
				typeof activeElement.contentDocument === 'object'
				&& activeElement.contentDocument !== null
			) {
				return getActiveSelection(activeElement.contentDocument);
			}
		} catch (e) {
			return document.getSelection() + '';
		}

		/* Get the selection from inside a text control. */
		if (typeof activeElement.value === 'string') {
			if (activeElement.selectionStart !== activeElement.selectionEnd) {
				return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
			}

			return activeElement.value;
		}

		/* Get the normal selection. */
		return document.getSelection() + '';
	}

	if (s === '') {
		s = getActiveSelection(document) || prompt('Enter your start and end IP here, separated by a space and/or dash');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection(document) + '$2');
	}

	if (s) {
		const url = new URL('https://netyogi.net/ip-to-cidr');

		/* Crudely extract strings that look like IPv4 or IPv6 addresses, and
		 * use the first and last match as the start and end of the range. */
		const ipv4Matches = s.match(/\b(([0-9]{1,3}\.){3}[0-9]{1,3})\b/g);
		if (ipv4Matches?.length >= 2) {
			url.searchParams.set('start', ipv4Matches.shift());
			url.searchParams.set('end', ipv4Matches.pop());
			location = url;
			return;
		}

		const ipv6Matches = s.match(/\b(([0-9a-f]{0,4}:){2,7}[0-9a-f])\b/g);
		if (ipv6Matches?.length >= 2) {
			url.searchParams.set('start', ipv6Matches.shift());
			url.searchParams.set('end', ipv6Matches.pop());
			location = url;
			return;
		}

		alert('No pair of IPv4 or IPv6 addresses found in text:\n\n' + s);
	}
})(document);
