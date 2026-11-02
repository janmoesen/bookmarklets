/**
 * Try to color the cells of comparison tables based on their contents.
 *
 * @title Compare cells
 */
(function comparecells() {
	const CHAR_SOFT_HYPHEN = String.fromCharCode(173);

	/**
	 * Get the text content for the given element.
	 */
	function getTextFromElement(element) {
		return element.textContent
			.replaceAll(CHAR_SOFT_HYPHEN, '')
			.replaceAll(/\s+/g, '')
			.trim()
			.toLowerCase();
	}

	/**
	 * Get a Uint8Array of the SHA-256 bytes for the given string.
	 */
	async function getSha256Bytes(string) {
		try {
			if (
				typeof crypto === 'object' && typeof crypto.subtle === 'object' && typeof crypto.subtle.digest === 'function'
				&& typeof Uint8Array === 'function'
				&& typeof TextEncoder === 'function'
			) {
				return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder('utf-8').encode(string)));
			}
		} catch (e) {
			return null;
		}
	}

	async function getColorsForValue(value) {
		/* Cache the calculated values. */
		getColorsForValue.cellValuesToRgb = getColorsForValue.cellValuesToRgb || {};

		if (!getColorsForValue.cellValuesToRgb[value]) {
			let normalizedValue = value.trim().toLowerCase();
			let hash;

			let yesValues = [
				'✔',
				'yes',
				'ja',
				'oui',
				'si',
				'sí'
			];

			let noValues = [
				'x',
				'no',
				'nee',
				'neen',
				'nein',
				'non',
				'no'
			];

			if (yesValues.indexOf(normalizedValue) > -1) {
				/* Make "Yes" cells green. */
				getColorsForValue.cellValuesToRgb[value] = [ 150, 255, 32 ];
			} else if (noValues.indexOf(normalizedValue) > -1) {
				/* Make "No" cells green. */
				getColorsForValue.cellValuesToRgb[value] = [ 238, 32, 32 ];
			} else if ((shaBytes = await getSha256Bytes(normalizedValue))) {
				/* Give other cells a color based on their content’s SHA
				 * hash to ensure “consistent random colors” every time. */
				getColorsForValue.cellValuesToRgb[value] = [
					shaBytes[0],
					shaBytes[1],
					shaBytes[2]
				];
			} else {
				/* If the SHA hash could not be calculated, just use random
				 * values. These will change on every execution. */
				getColorsForValue.cellValuesToRgb[value] = [
					Math.random() * 255,
					Math.random() * 255,
					Math.random() * 255
				];
			}
		}

		/* Calculate/approximate the lightness (tweaked from “RGB to HSL”) to
		 * determine whether black or white text is best suited. */
		let isLight = 150 < (
			getColorsForValue.cellValuesToRgb[value][0] * 0.299
			+ getColorsForValue.cellValuesToRgb[value][1] * 0.587
			+ getColorsForValue.cellValuesToRgb[value][2] * 0.114
		);

		return {
			backgroundColor: 'rgba(' + getColorsForValue.cellValuesToRgb[value].join(', ') + ', 0.15)',
			outlineColor: 'rgb(' + getColorsForValue.cellValuesToRgb[value].join(', ') + ')',
		};
	}

	/* The main function. */
	(function execute(document) {
		document.querySelectorAll('table, [role~="table"]').forEach(table => {
			table.querySelectorAll('tbody, [role~="rowgroup"]').forEach(tBody => {
				const rows = tBody.querySelectorAll('tr, [role~="row"]');

				rows.forEach(tr => {
					/* Determine the values. */
					let cellValues = [];
					let uniqueCellValues = new Set();
					const cells = tr.querySelectorAll('td, [role~="cell"]');

					cells.forEach((cell, i) => {
						/* Don't take the header cells into account. */
						if (cell.matches('th, [role="columnheader"], [role="rowheader"]')) {
							return;
						}

						/* Assume the first cell is a header cell, even if it is not a TH. */
						if (
							i === 0
							/* Exception: apple.com comparison tables: https://www.apple.com/mac/compare/?modelList=MacBook-Air-M5,MacBook-Pro-14-M5-Max,MacBook-Pro-proled-xdr-m5max-14 */
							&& !(document.domain === 'www.apple.com' && document.location.pathname.indexOf('/compare/') > -1)
						) {
							return;
						}

						cellValues[i] = getTextFromElement(cell);
						uniqueCellValues.add(cellValues[i]);
					});

					/* Color (or not) the cells based on the values. */
					let isFirstValue = true;
					let firstValue;
					cellValues.forEach(async function(cellValue, i) {
						let hasTwoUniqueValues = uniqueCellValues.size == 2;
						if (isFirstValue) {
							firstValue = cellValue;
							isFirstValue = false;
						}

						let backgroundColor;
						let outlineColor;

						if (
							uniqueCellValues.size == 1 ||
							(hasTwoUniqueValues && cellValue === firstValue) ||
							cellValue.trim() === ''
						) {
							backgroundColor = 'inherit';
							outlineColor = 'inherit';
						} else {
							backgroundColor = (await getColorsForValue(cellValue)).backgroundColor;
							outlineColor = (await getColorsForValue(cellValue)).outlineColor;
						}

						cells[i].style.setProperty('background-color', backgroundColor, 'important');
						cells[i].style.setProperty('outline', `3px solid ${outlineColor}`, 'important');
						cells[i].style.setProperty('box-shadow', `3px ${outlineColor}`, 'important');
					});
				});
			});
		});

		/* Recurse for (i)frames. */
		try {
			Array.from(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(
				elem => { try { execute(elem.contentDocument) } catch (e) { } }
			);
		} catch (e) {
			/* Catch and ignore exceptions for out-of-domain access. */
		}
	})(document);
})();
