/**
 * Try to color the cells of comparison tables based on their contents.
 *
 * @title Compare cells
 */
(function comparecells() {
	/**
	 * Get the text content for the given element.
	 */
	function getTextFromElement(element) {
		/* TODO: take IMG@alt, BUTTON@value etc. into account */
		return element.textContent.trim().toLowerCase();
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
			backgroundColor: 'rgb(' + getColorsForValue.cellValuesToRgb[value].join(', ') + ')',
			color: isLight
				? 'black'
				: 'white',
			textShadow: isLight
				? '1px 1px 3px white'
				: '1px 1px 3px black'
		};
	}

	/* The main function. */
	(function execute(document) {
		Array.from(document.querySelectorAll('table')).forEach(table => {
			Array.from(table.tBodies).forEach(tBody => {
				if (tBody.rows.length < 3) {
					console.log('Compare cells: skipping table body ', tBody, ' because it only has ', tBody.rows.length, ' rows');
					return;
				}

				Array.from(tBody.rows).forEach(tr => {
					/* Determine the values. */
					let cellValues = [];
					let uniqueCellValues = new Set();

					Array.from(tr.cells).forEach((cell, i) => {
						/* Don't take the header cells into account. */
						if (cell.tagName.toUpperCase() === 'TH') {
							return;
						}

						/* Assume the first cell is a header cell, even if it is not a TH. */
						if (i === 0) {
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
						let color;
						let textShadow;

						if (
							uniqueCellValues.size == 1 ||
							(hasTwoUniqueValues && cellValue === firstValue) ||
							cellValue.trim() === ''
						) {
							backgroundColor = 'inherit';
							color = 'inherit';
							textShadow = 'inherit';
						} else {
							backgroundColor = (await getColorsForValue(cellValue)).backgroundColor;
							color = (await getColorsForValue(cellValue)).color;
							textShadow = (await getColorsForValue(cellValue)).textShadow;
						}

						tr.cells[i].style.setProperty('background-color', backgroundColor, 'important');
						tr.cells[i].style.setProperty('color', color, 'important');
						tr.cells[i].style.setProperty('text-shadow', textShadow, 'important');
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
