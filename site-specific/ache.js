/**
 * ACHE: the ActiveCollab Hours Evaluator.
 *
 * I hate the time record overviews on our company's ActiveCollab installation.
 * It does not show the total hours logged per day when on an multi-day
 * overview (e.g. week or month). This fixes that.
 *
 * @title ACHE
 */
(function ache() {
	var total = 0;
	Array.prototype.slice.call(document.querySelectorAll('.time_record')).forEach(function (record) {
		var date = record.querySelector('.date').textContent,
		    hours = parseFloat(record.querySelector('.hours').textContent),
		    nextDate = record.nextElementSibling && record.nextElementSibling.classList.contains('time_record') && record.nextElementSibling.querySelector('.date').textContent;
		total += hours;
		if (date !== nextDate) {
			var totalCell = record.parentNode.insertRow(record.rowIndex).insertCell(0);
			totalCell.setAttribute('colspan', record.cells.length);
			totalCell.setAttribute('style', 'background: #950000; color: #fff;');
			totalCell.textContent = ['Total for ', date, ': ', total].join('');
			total = 0;
		}
	})
}())
