/**
 * Search for a company number / VAT number in the Belgian company registry
 * “Crossroads Bank for Enterprises”: https://kbopub.economie.fgov.be/
 *
 * If the selected text or parameter does not look like a VAT number, look it
 * up as the company name.
 *
 * @title KBO
 */
(function kbo(document) {
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

		let activeElement = document.activeElement;

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

	let isSelectedText = false;

	if (s === '') {
		if ((s = getActiveSelection(document))) {
			isSelectedText = true;
		} else {
			s = prompt('Please enter the Belgian company number / VAT number:');
		}
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection(document) + '$2');
	}

	if (s) {
		const possibleVatNumbers = [];
		const regexp = /\b(?<bePrefix>BE)?\s?(?<leadingDigit>[01])?(?<p1>\d{3})([ .-]?)(?<p2>\d{3})\4(?<p3>\d{3})\b/gi;
		for (const matches of s.matchAll(regexp)) {
			/* This looks like a Belgian company number. */
			possibleVatNumbers.push({
				hasBePrefix: !!matches.groups.bePrefix,
				hasLeadingZero: matches.groups.leadingDigit === '0',
				vatNumber: (matches.groups.leadingDigit || '') + matches.groups.p1 + matches.groups.p2 + matches.groups.p3,
				matches
			});
		}

		if (possibleVatNumbers.length) {
			const bestMatch =
				possibleVatNumbers.find(possibleVatNumber => possibleVatNumber.hasBePrefix)
				/* Numbers starting with `04` are often just telephone numbers, e.g. `0479 000 000`. */
				|| possibleVatNumbers.find(possibleVatNumber => possibleVatNumber.hasLeadingZero && !possibleVatNumber.vatNumber.match(/^04/))
				|| possibleVatNumbers[0];

			location = 'https://kbopub.economie.fgov.be/kbopub/toonondernemingps.html?ondernemingsnummer='
				+ encodeURIComponent(bestMatch.vatNumber);

		} else {
			let normalizedS = s.trim().replaceAll(/ (bus|boîte|boite) /gi, 'b').replaceAll(/\s+/g, ' ');
			let matches = normalizedS.match(/(?<street>.{3,63}[^0-9]),? (?<number>\d+[^,]{0,5})[,/-]? (?<postalCode>[1-9]\d\d\d)\b/)
				|| normalizedS.match(/(?<number>\d+[^,]{0,5}),? (?<street>.{3,63}[^0-9]),? (?<postalCode>[1-9]\d\d\d)\b/);

			if (matches) {
				/* This looks like a Belgian address. */
				location = `https://kbopub.economie.fgov.be/kbopub/zoekadresform.html?${new URLSearchParams({
					filterEnkelActieve: false,
					actionLU: 'Zoek',
					sort: 'SORT_BY_ENTERPRISE_NUMBER',
					dir: 'asc',
					postcod1: matches.groups.postalCode,
					postgemeente1: '',
					straatgemeente1: matches.groups.street,
					huisnummer: matches.groups.number,
				})}`;
				return;
			}

			if (isSelectedText && s.length > 512) {
				alert('No Belgian company number / VAT number or easily-parsable postal address was found in the text you selected. If you select a shorter text, it will be used to look up the company by name.');
				return;
			}

			location = `https://kbopub.economie.fgov.be/kbopub/zoeknaamfonetischform.html?${new URLSearchParams({
				oudeBenaming: 'true',
				ondNP: 'true',
				ondRP: 'true',
				rechtsvormFonetic: 'ALL',
				vest: 'true',
				filterEnkelActieve: 'false',
				sort: 'SORT_BY_ENTERPRISE_NUMBER',
				dir: 'asc',
				searchWord: s,
			})}`;
		}
	}
})(document);
