/**
 * Allow sorting tables from their headers.
 *
 * This is not meant to be a super intelligent sorting algorithm for all kinds
 * of content. (For that, use something like the jQuery tablesorter plugin:
 * https://mottie.github.io/tablesorter/. Rather, it is smart enough to sort
 * strings in a natural fashion. Examples:
 *
 * - “foo1” comes before “FOO002” because it is case-insensitive and the
 *   numbers are sorted numerically, not orthographically.
 *
 * - “- EUR 99” comes before “EUR 1” because it considers the minus sign (or
 *   dash or hyphen) to be part of the number if there only a limited number of
 *   characters in between.
 *
 * - “https://www.example.com/” comes before “https://google.com/”
 *   because it ignores “www.”, and “http://www.example.com/zzz” comes before
 *   “https://example.com/aaa”, because “http://” comes before “https://”.
 *
 * - “31 Dec 2019” comes before “1 Apr 2020” because parsable dates are sorted
 *   chronologically.
 *
 * @title Sort tables
 */
(function sort() {
	'use strict';

	const localeCompareOptions = {
		usage: 'sort',
		sensitivity: 'base',
		numeric: true
	};

	/* Crudely match some number localization formats. */
	const regexpForThousandsWithCommas = /^(\d{1,3}(?:,\d{3})+(?:\.\d+)?)$/;
	const regexpForThousandsWithPeriods = /^(\d{1,3}(?:\.\d{3})+(?:,\d+)?)$/;
	const regexpForThousandsWithSpaces = /^(\d{1,3}(?:\s\d{3})+(?:,\d+)?)$/;
	const regexpForDecimalsWithPeriod = /^(\d+(?:\.\d+)?)$/;
	const regexpForDecimalsWithComma = /^(\d+,\d+)$/;

	/* Match strings with the year 1700–2199 and at least one other number in
	 * them, e.g. “24 Feb 2020”). */
	const regexpForDateWithYearAndNumber = /\b(?:1[7-9][0-9]{2}|2[0-1][0-9]{2})\b.*[^0-9][0-9]{1,2}(?:[^0-9]|$)/;
	const regexpForDateWithNumberAndYear = /(?:^|[^0-9])[0-9]{1,2}[^0-9].*\b(?:1[7-9][0-9]{2}|2[0-1][0-9]{2})\b/;

	/* Taken from https://github.com/angular/angular/blob/4.3.x/packages/common/src/pipes/number_pipe.ts#L172 */
	function isNumeric(value) {
		return !isNaN(value - parseFloat(value));
	}

	/**
	 * Extract the text from a given HTML element. Not just its `textContent`,
	 * but also the text inside IMG@alt, INPUT@value, etc.
	 */
	function extractTextContent(element, forceExtraction) {
		extractTextContent.cachedElements = extractTextContent.cachedElements || [];
		if (extractTextContent.cachedElements.indexOf(element) > -1) {
			return element.xxxJanTextContent;
		}

		extractTextContent.cachedElements.push(element);

		return element.xxxJanTextContent = Array.from(element.childNodes).map(node => {
			if (node instanceof HTMLImageElement || (node instanceof HTMLInputElement && node.type === 'image')) {
				/* For images, use IMG@alt, IMG@title, or IMG@src. */
				if (node.hasAttribute('alt')) {
					return node.alt;
				}

				if (node.hasAttribute('title')) {
					return node.title;
				}

				if (node.hasAttribute('src')) {
					return node.src;
				}
			}

			if (node instanceof HTMLInputElement && (node.type === 'radio' || node.type === 'checkbox')) {
				/* For radio buttons and checkboxes, take the checked status into account. */
				return (node.checked ? '1' : '0') + node.value;
			}

			if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
				/* For all other text and similar inputs, use their value. */
				return node.value;
			}

			if (node instanceof HTMLSelectElement) {
				/* For “select-one” and “select-multiple” lists, use the
				 * text (or value) of the first selected option, if any. */
				return node.options[node.selectedIndex]
					? node.options[node.selectedIndex].label || node.options[node.selectedIndex].value
					: node.textContent;
			}

			if (node instanceof HTMLElement) {
				/* For all other HTML elements, recurse. */
				return extractTextContent(node, forceExtraction);
			}

			/* For all other nodes, simply use the text. */
			return node.textContent;
		}).join('');
	}

	/**
	 * Split the given string into pure text and number-ish chunks.
	 *
	 * E.g. `$1,200,000 --,` will return `['$', '1,200,000', ' --,']`
	 *
	 * - If the possible number starts with one to three digits followed by
	 *   one or more groups of a comma followed by exactly three digits,
	 *   optionally followed by a period and at least one digit, it is
	 *   considered to be a formatted number with “,” as the thousands
	 *   separator and “.” as the decimal separator.
	 * - If the possible number starts with one to three digits followed by
	 *   one or more groups of a period followed by exactly three digits,
	 *   optionally followed by a comma and at least one digit, it is
	 *   considered to be a formatted number with “.” as the thousands
	 *   separator and “,” as the decimal separator.
	 *
	 * This is not suitable for i18n/g11n/l10n. It will only recognize “,” and
	 * “.” as thousands separators, and not, for example, Indian ten-thousands
	 * separators or French spaces as thousands separators — have a look at
	 * https://globalizejs.com/ for that.
	 */
	function splitByNumbers(text) {
		splitByNumbers.cache = splitByNumbers.cache || {};
		if (splitByNumbers.cache[text]) {
			return splitByNumbers.cache[text];
		}

		let chunks = [];
		/* First do a coarse split to filter out everything that could be a
		 * number, without a fine-tuned syntax check. */
		const coarseChunks = text.split(/([0-9]+(?:[0-9,.\s]*[0-9])?)/);

		coarseChunks.forEach((coarseChunk, i) => {
			if (i % 2 === 0) {
				/* This is a text chunk because the `.split` remembers the
				 * strings matching the number-ish pattern, e.g.
				 * `'Foo bar 123 corge 45 67 quux'` is split into
				 * `[ 'Foo bar', ' 123', ' corge', ' 45', '', ' 67', ' quux' ]`
				 */
				return chunks.push(coarseChunk);
			}

			let number = undefined;
			let matches;
			if ((matches = coarseChunk.match(regexpForThousandsWithCommas))) {
				number = coarseChunk.trim().replace(/,/g, '');
			} else if ((matches = coarseChunk.match(regexpForThousandsWithPeriods))) {
				number = coarseChunk.trim().replace(/[,.]/g, char => char === ',' ? '.' : '');
			} else if ((matches = coarseChunk.match(regexpForThousandsWithSpaces))) {
				number = coarseChunk.trim().replace(/[,\s]/g, char => char === ',' ? '.' : '');
			} else if ((matches = coarseChunk.match(regexpForDecimalsWithPeriod))) {
				number = coarseChunk.trim();
			} else if ((matches = coarseChunk.match(regexpForDecimalsWithComma))) {
				number = coarseChunk.trim().replace(',', '.');
			}

			/* The minus sign, if any, is not included in the first number chunk,
			 * to avoid strange results when sorting file names. (Because then
			 * “file-002.jpg” would come before “file-001.jpg”.) However, if the
			 * text chunk before the first number chunk ends with a minus sign
			 * (e.g. the original text was “$-1,200,000”), or starts with a
			 * number sign followed by just a few characters before the number
			 * chunk (e.g. “- EUR 123”), it is removed from that text chunk
			 * and the number is made negative. */
			if (i === 1) {
				if ((matches = chunks[0].match(/(-|−|‐)\s{0,3}$/)) && !text.match(/\.[^0-9.]+\s*$/)) {
					chunks[0] = chunks[0].slice(0, matches[0].length);
					number = (-number).toString();
				} else if ((matches = chunks[0].match(/^(\s*)(?:-|−|‐)(\s{0,2}.{0,3}\s{0,2})$/))) {
					chunks[0] = matches[1] + matches[2];
					number = (-number).toString();
				}
			}

			if (number !== undefined) {
				return chunks.push(number);
			}

			return chunks.push(coarseChunk);
		});

		return splitByNumbers.cache[text] = chunks;
	}

	/**
	 * Determine (i.e., guess) the content type of the given element based on
	 * its text content.
	 */
	function determineContentType(text, forceDetermination) {
		determineContentType.cache = determineContentType.cache || {};
		if (!forceDetermination && determineContentType.cache[text]) {
			return determineContentType.cache[text];
		}

		/* Numbers. */
		if (isNumeric(text)) {
			return determineContentType.cache[text] = 'number';
		}

		/* HTTP(S) URLs. */
		if (text.match(/^\s*https?:\/\//)) {
			return determineContentType.cache[text] = 'url';
		}

		/* IPv4 addresses/ */
		let matches;
		if (
			(matches = text.match(/^\s*(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*(\S|$)/))
			&& parseInt(matches[1], 10) < 256
			&& parseInt(matches[2], 10) < 256
			&& parseInt(matches[3], 10) < 256
			&& parseInt(matches[4], 10) < 256
		) {
			return determineContentType.cache[text] = 'ipv4';
		}

		/* Dates. */
		if (text.match(regexpForDateWithYearAndNumber) || text.match(regexpForDateWithNumberAndYear)) {
			const date = new Date(text);
			const timestamp = date.getTime();
			if (!isNaN(timestamp)) {
				return determineContentType.cache[text] = 'date';
			}
		}

		/* Default: text. */
		return determineContentType.cache[text] = 'text';
	}

	/**
	 * Determine the locale of the given element, based on its `lang`
	 * attribute, or the `lang` attribute of its nearest ancestor with that
	 * attribute.
	 */
	function determineLocale(element) {
		if (element.lang) {
			return element.lang;
		}

		determineLocale.cachedElements = determineLocale.cachedElements || [];
		if (determineLocale.cachedElements.indexOf(element) > -1) {
			return element.xxxJanLocale;
		}

		determineLocale.cachedElements.push(element);

		const closestAncestorWithLang = element.closest('[lang]');
		if (closestAncestorWithLang) {
			return element.xxxJanLocale = closestAncestorWithLang.lang;
		}

		return element.xxxJanLocale = '';
	}

	/**
	 * Calculate the sort key for the given text based on the requested content type.
	 */
	function calculateSortKey(text, contentType, forceCalculation) {
		calculateSortKey.cache = calculateSortKey.cache || {};
		if (!forceCalculation && calculateSortKey.cache[text]) {
			return calculateSortKey.cache[text];
		}

		let matches;

		if (!contentType) {
			contentType = determineContentType(text, forceCalculation);
		}

		if (contentType === 'number') {
			const trimmedText = text.trim();
			let number = parseFloat(trimmedText);

			/* Sort numbers numerically (duh). If the number has leading
			 * zeros, sort them before (if negative) or after (if positive)
			 * the same number with fewer or no leading zeros. Inspired by
			 * https://mottie.github.io/tablesorter/docs/example-parsers-leading-zeros.html and
			 * https://github.com/Mottie/tablesorter/blob/03eeb2e819cf/js/parsers/parser-leading-zeros.js
			 */
			if (trimmedText.match(/^-?\s*0+/)) {
				const precision = number > 0
					? -1e-10
					: 1e-10;
				number += precision * (trimmedText.length - number.toString().length);
			}

			return calculateSortKey.cache[text] = number;
		}

		if (contentType === 'url') {
			/* Sort HTTP(S) URLs by their host (without the “www.” prefix)
			 * first, their scheme (HTTP or HTTPS) second, and the path
			 * third. */
			if ((matches = text.match(/^\s*(https?:\/\/)(?:www\.)?([^\/]+)(.*)/))) {
				const scheme = matches[1] === 'http://'
					? 'r' /* Sort “http” before “https” (“r” < “s”) */
					: 's';

				const host = matches[2]; /* Without “www.” */
				const path = matches[3] || '';

				return calculateSortKey.cache[text] = host + scheme + path;
			}
		}

		if (contentType === 'ipv4') {
			/* Sort IPv4 addresses by their integer representation. */
			const parts = text.split('.');
			return calculateSortKey.cache[text] = 0
				+ parseInt(parts[3])
				+ parseInt(parts[2]) * 256
				+ parseInt(parts[1]) * 256 * 256
				+ parseInt(parts[0]) * 256 * 256 * 256;
		}

		/* Sort dates by their ISO 8601 representation.
		 *
		 * Note from MDN: “Parsing of date strings with the Date constructor
		 * (and Date.parse, they are equivalent) is strongly discouraged due
		 * to browser differences and inconsistencies.”
		 */
		if (contentType === 'date') {
			if (text.length >= 8) {
				const date = new Date(text);
				const timestamp = date.getTime();
				if (!isNaN(timestamp)) {
					return calculateSortKey.cache[text] = date.toISOString();
				}
			}
		}

		/* By default, sort by the node’s text content. */
		return calculateSortKey.cache[text] = text;
	}

	/**
	 * Callback for `Array#sort`, to sort the rows in ascending order.
	 */
	function rowSorterAsc(row1, row2, colIndex, contentType) {
		const cell1 = row1.cells[colIndex];
		const cell2 = row2.cells[colIndex];

		if (!cell1 && cell2) {
			return -1;
		} else if (cell1 && !cell2) {
			return 1;
		}

		const cell1TextContent = extractTextContent(cell1);
		const cell2TextContent = extractTextContent(cell2);

		const cell1SortKey = calculateSortKey(cell1TextContent, contentType);
		const cell2SortKey = calculateSortKey(cell2TextContent, contentType);

		const locale = determineLocale(cell1) || determineLocale(cell2) || undefined;

		/* If there is no text, sort by the inner HTML code. */
		if (cell1TextContent === '' && cell2TextContent === '') {
			return cell1.innerHTML.localeCompare(cell2.innerHTML, locale, localeCompareOptions);
		}

		/* For numbers, sort keys are guaranteed to be numbers or NaN so we
		 * can use the normal comparison operators. In all other cases, the
		 * sort keys are strings and we use `localeCompare`. */
		if (contentType === 'number' || contentType === 'ipv4') {
			const cell1SortKeyIsNumber = !isNaN(cell1SortKey) && typeof cell1SortKey === 'number';
			const cell2SortKeyIsNumber = !isNaN(cell2SortKey) && typeof cell2SortKey === 'number';

			if (cell1SortKeyIsNumber && cell2SortKeyIsNumber) {
				if (cell1SortKey === cell2SortKey) {
					return 0;
				} else if (cell1SortKey < cell2SortKey) {
					return -1;
				} else {
					return 1;
				}
			} if (cell1SortKeyIsNumber && !cell2SortKeyIsNumber) {
				return -1;
			} else if (!cell1SortKeyIsNumber && cell2SortKeyIsNumber) {
				return 1;
			} else {
				/* If both sort keys are NaN, fall back to the default
				 * `localeCompare` on the original text content. */
				return cell1TextContent.localeCompare(cell2TextContent, locale, localeCompareOptions);
			}
		}

		/* Use regular `localeCompare` for dates (whose sort keys are
		 * ISO date strings) and URLs (whose sort keys are normalized
		 * host names + schemes + rest of the URL). */
		if (contentType === 'date' || contentType === 'url') {
			return cell1SortKey.localeCompare(cell2SortKey, locale, localeCompareOptions);
		}

		/* For all other text, sort chunk by chunk, with the chunks
		 * being either text parts or number-ish parts. */
		const cell1Chunks = splitByNumbers(cell1TextContent);
		const cell2Chunks = splitByNumbers(cell2TextContent);

		let minNumChunks = Math.min(cell1Chunks.length, cell2Chunks.length);
		let i;
		for (let i = 0; i < minNumChunks; i++) {
			const chunk1 = cell1Chunks[i];
			const chunk2 = cell2Chunks[i];

			let localeComparison;

			if (chunk1 === chunk2 || (localeComparison = chunk1.trim().localeCompare(chunk2.trim(), locale, localeCompareOptions)) === 0) {
				continue;
			}

			if (i % 2 === 1 && isNumeric(chunk1) && isNumeric(chunk2)) {
				const float1 = parseFloat(chunk1);
				const float2 = parseFloat(chunk2);

				/* The values are the same, but the strings differ (e.g. “9.8” vs. “9.80”) */
				if (float1 === float2) {
					return chunk1.localeCompare(chunk2, locale, localeCompareOptions);
				}

				return float1 < float2
					? -1
					: 1;
			}

			return localeComparison;
		}

		return cell1TextContent.localeCompare(cell2TextContent, locale, localeCompareOptions);
	}

	/**
	 * Callback for `Array#sort`, to sort the rows in descending order. This
	 * simply returns the result from the ascending sorter callback with the
	 * arguments swapped around.
	 */
	function rowSorterDesc(row1, row2, colIndex, contentType) {
		return rowSorterAsc(row2, row1, colIndex, contentType);
	}

	/**
	 * Clear the caches used by some heavy functions.
	 */
	function clearCaches() {
		splitByNumbers.cache = {};

		calculateSortKey.cache = {};

		determineContentType.cache = {};

		(extractTextContent.cachedElements || []).forEach(element => delete element.xxxJanTextContent);
		extractTextContent.cachedElements = [];

		(determineLocale.cachedElements || []).forEach(element => delete element.xxxJanLocale);
		determineLocale.cachedElements = [];
	}

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		Array.from(document.querySelectorAll('table')).forEach(table => {
			if (!table.tBodies.length || !table.tBodies[0].rows.length) {
				return;
			}

			const headerRow = table.tHead && table.tHead.rows[0] && table.tHead.rows[0].cells.length
				? table.tHead.rows[0]
				: table.tBodies[0].rows[0];

			const sortingIndicators = [];

			Array.from(headerRow.cells).forEach((headerCell, colIndex) => {
				/* Show the sorting indicator on the current column. */
				if (!headerCell.xxxJanSortingIndicator) {
					const sortingIndicator = document.createElementNS('http://www.w3.org/1999/xhtml', 'span');
					sortingIndicator.textContent = '▚';

					sortingIndicators.push(sortingIndicator);

					if (getComputedStyle(headerCell).position === 'static') {
						headerCell.style.position = 'relative';
					}

					sortingIndicator.setAttribute('style', `
						display: inline-block;
						position: absolute;
						right: 0;
						top: 0;
						min-width: 1.5em;
						min-height: 3ex;
						text-align: right;
						opacity: 0.5;
						text-shadow: -2px 2px 4px black, 2px 2px 4px white;
						cursor: pointer;
					`);

					const onFocus = _ => sortingIndicator.style.opacity = 1;
					const onBlur = _ => sortingIndicator.style.opacity = 0.5;
					['focus', 'mouseenter'].forEach(eventName => sortingIndicator.addEventListener(eventName, onFocus));
					['blur', 'mouseleave'].forEach(eventName => sortingIndicator.addEventListener(eventName, onBlur));

					sortingIndicator.tabIndex = 0;

					headerCell.xxxJanSortingIndicator = headerCell.appendChild(sortingIndicator);
				}

				/* Sort on click and Enter. */
				const handler = function (event) {
					/* Determine the sorting direction, starting with ascending. */
					headerCell.xxxJanSortingDirection = headerCell.xxxJanSortingDirection === 'asc'
						? 'desc'
						: 'asc';

					/* Update the sorting indicators. */
					sortingIndicators.forEach(indicator => indicator.textContent = '▚');

					headerCell.xxxJanSortingIndicator.textContent = headerCell.xxxJanSortingDirection === 'asc'
						? '▲'
						: '▼';

					/* Sort each of the table’s bodies separately. */
					Array.from(table.tBodies).forEach(tBody => {
						const skipFirstRow = headerRow.closest('tbody') === tBody;

						if (tBody.rows.length === (skipFirstRow ? 1 : 0)) {
							return;
						}

						/* Guess the column’s content type based on the first rows. */
						if (!headerCell.xxxJanContentType) {
							const numRowsToCheck = Math.min(tBody.rows.length, 50);
							const countersPerContentType = {};

							let rowIndex;
							for (rowIndex = (skipFirstRow ? 1 : 0); rowIndex < numRowsToCheck; rowIndex++) {
								const cell = tBody.rows[rowIndex].cells[colIndex];

								if (!cell) {
									continue;
								}

								const contentType = determineContentType(extractTextContent(cell));

								countersPerContentType[contentType] = countersPerContentType[contentType]
									? countersPerContentType[contentType] + 1
									: 1;
							}

							const mostCommonContentType = Object.entries(countersPerContentType)
								.sort((a, b) => a[1] === b[1] ? 0 : (a[1] < b[1] ? -1 : 1))
								.pop()[0];

							headerCell.xxxJanContentType = mostCommonContentType;
						}

						/* Determine which sorter to use based on the current direction. */
						const rowSorter = headerCell.xxxJanSortingDirection === 'asc'
							? rowSorterAsc
							: rowSorterDesc;

						/* Sort the rows in memory. */
						let sortedRows = Array.from(tBody.rows)
							.slice(skipFirstRow ? 1 : 0)
							.sort((row1, row2) => rowSorter(row1, row2, colIndex, headerCell.xxxJanContentType));

						/* Update the DOM. By not introducing any new elements, all
						 * event handlers are left intact. It is slower than doing
						 * it out of the DOM, though. */
						sortedRows.forEach((row, sortedRowIndex) => {
							row.parentNode.insertBefore(row, row.parentNode.rows[sortedRowIndex + 1] || null);
						});
					});

					/* Get rid of the cached text contents, content types, sort keys, … */
					clearCaches();
				};

				headerCell.addEventListener('click', handler);
				headerCell.addEventListener('keypress', event => (event.code === 13 || event.keyCode === 13) && handler(event));
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
	}

	execute(document);
})();
