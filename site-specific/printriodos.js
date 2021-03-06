/**
 * Improve the Triodos account statement print-out.
 *
 * This bookmarklets adds the account balance after each operation, which
 * makes it easier to keep track of the balance throughout the year/month.
 *
 * It also darkens the odd row background so it stands out more when printing
 * in black and white. (Remember to check the "Print background colours and
 * images" box.)
 *
 * @title Triodos pretty-printer
 */
(function printriodos() {
	var table = document.querySelector('table[id$=":searchResultTable"]');

	/* Add a column with the total after each movement. */
	var total = parseFloat(
		document.querySelector('.dataView table:first-child tr:first-child td:last-child')
			.textContent
			.replace('.', '')
			.replace(',', '.')
	);

	Array.prototype.slice.call(table.querySelectorAll('tbody[id$="searchResultTable:tb"] td:last-child')).reverse().forEach(function (td) {
		td.style.textAlign = 'right';

		var amount = td.textContent.replace('.', '').replace(',', '.');
		total = (parseFloat(total) + parseFloat(amount)).toFixed(2);
		var newTd = td.cloneNode();
		newTd.textContent = total.replace('.', ',').replace(/([0-9])([0-9]{3}),/, '$1.$2,');
		td.classList.remove('lastItem');
		td.parentNode.appendChild(newTd);
	});

	/* Add a header cell for the column we just added. */
	var th = table.querySelector('thead th:last-child');
	var newTh = th.cloneNode();
	newTh.textContent = 'Saldo (EUR)';
	th.parentNode.appendChild(newTh);

	/* Keep the pretty background colours when printing. (This needs to be enabled in the printer options dialog, too.) */
	Array.prototype.slice.call(document.querySelectorAll('link[rel="StyleSheet"][media="screen"]')).forEach(function (link) {
		link.media = 'all';
	});

	/* Avoid double borders on the last cell. */
	document.head.appendChild(document.createElementNS('http://www.w3.org/1999/xhtml', 'style')).textContent = '.dataView th:last-child, .dataView td:last-child { border-right: 0; }';

	/* Make the difference between rows more pronounced. */
	document.head.appendChild(document.createElementNS('http://www.w3.org/1999/xhtml', 'style')).textContent = '.dataView tr.evenRow th, .dataView tr.evenRow td { background-color: #cee; }';
})();
