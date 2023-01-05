/**
 * Go to the specified (lat, lng) coordinates with Mapillary.
 *
 * @title Mapillary
 */
(function mapi(document) {
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
		s = getActiveSelection(document) || prompt('Specify the (lat, lng) coordinates:');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection(document) + '$2');
	}

	if (s) {
		const [lat, lng] = s
			.replace(/^\s*\(\s*/, '')
			.replace(/\s*\(\s*$/, '')
			.replace(/^https:\/\/www\.google\.com\/maps\/([^@]+\/)*@/, '')
			.split(/\s*[ ,]\s*/)
			.map(parseFloat);

		if (isNaN(lat) || isNaN(lng)) {
			alert(`Could not parse (lat, lng) coordinates from “${s}”`);
			return;
		}

		location = `https://www.mapillary.com/app/?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&z=15`;
	}
})(document);
