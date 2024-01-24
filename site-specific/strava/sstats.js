/**
 * Expand the statistics on a Strava profile by adding average
 * distance/elevation gain/speed per activity.
 *
 * @title Expand Strava stats
 */
(function sstats() {
	'use strict';

	const isDebug = false;

	/**
	 * Convert a formatted number to an actual number, guessing the decimal
	 * and thousands separators.
	 */
	function parseNumberFromFormattedText(text) {
		text = text.trim();

		let type;
		let number = NaN;
		let decimalSeparator;
		let thousandsSeparator;

		let matches;

		if ((matches = text.match(/^([0-9]+)\b[^0-9]*$/))) {
			number = parseInt(matches[1], 10);
			type = `an integer without decimal separator or thousands separator`;
		} else if ((matches = text.match(/^([1-9][0-9]{1,2}([,.])[0-9]{1,2})\b[^0-9]*$/))) {
			decimalSeparator = matches[2];
			number = parseFloat(matches[1].replaceAll(thousandsSeparator, ''), 10);
			type = `a decimal number < 1000`;
		} else if ((matches = text.match(/^((?:[1-9][0-9]{0,2}([,.]))(?:[0-9]{3}\2)*[0-9]{3})\b[^0-9]*$/))) {
			thousandsSeparator = matches[2];
			number = parseInt(matches[1].replaceAll(thousandsSeparator, ''), 10);
			type = `an integer number with thousands separator “${thousandsSeparator}”`;
		} else if ((matches = text.match(/^((?:[1-9][0-9]{0,2}(,))(?:[0-9]{3}\2)*[0-9]{3}(\.)[0-9]+)\b[^0-9]*$/))) {
			thousandsSeparator = matches[2];
			decimalSeparator = matches[3];
			number = parseFloat(matches[1].replaceAll(thousandsSeparator, ''), 10);
			type = `a decimal number ≥ 1000”`;
		} else if ((matches = text.match(/^((?:[1-9][0-9]{0,2}(\.))(?:[0-9]{3}\2)*[0-9]{3}(,)[0-9]+)\b[^0-9]*$/))) {
			thousandsSeparator = matches[2];
			decimalSeparator = matches[3];
			number = parseFloat(matches[1].replaceAll(thousandsSeparator, '').replace(decimalSeparator, '.'), 10);
			type = `a decimal number ≥ 1000”`;
		} else {
			type = 'something I don’t recognize';
		}

		/* Debugging for number detection:
		↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
		isDebug && console.log(`sstats: “${text}” looks like ${type}; number = “${number}”; decimalSeparator = ${decimalSeparator === undefined ? decimalSeparator : `“${decimalSeparator}”`}; thousandsSeparator = ${thousandsSeparator === undefined ? thousandsSeparator : `“${thousandsSeparator}”`}; matches = `, matches);
		↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ */

		return number;
	}

	/* Rudimentary test cases for `parseNumberFromFormattedText`:
	↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
	['1', '12', '00', '09', '0123', '1234', '12345678', '70,578.1 km', '70.578,1 km', '768,742 m', '768.742 m', '66,743 m', '107,573 m', '418.3 km', '630.3 km', '1,533 m', '2,253 m', '123.456.789', '123,456,789', '123.456.789,01', '123,456,789.01', '12.30', '12,30'].forEach(text => {
		parseNumberFromFormattedText(text);
	});
	↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑ */

	let needsToAddCss = true;

	document.querySelectorAll('.sidebar tbody:nth-child(2n):not(#all-time-prs) + tbody').forEach(tbody => {
		const rowFields = ['numActivities', 'distance', 'elevationGain', 'time'];

		if (!tbody.rows[rowFields.length - 1]) {
			isDebug && console.log(`sstats: Could not find enough rows in tbody for all the data fields (“${rowFields.join('”, “')}”)`, tbody);
			return;
		}

		if (tbody.rows[0]?.dataset.xxxJanHasAddedStats) {
			isDebug && console.log('sstats: Already added stats to tbody: ', tbody);
			needsToAddCss = false;
			return;
		}

		tbody.rows[0].dataset.xxxJanHasAddedStats = true;

		isDebug && console.log('sstats: Processing tbody: ', tbody);

		const data = {};
		rowFields.forEach((field, rowIndex) => {
			if (!data[field]) {
				data[field] = [];
			}

			const row = tbody.rows[rowIndex];
			const dataCells = Array.from(tbody.rows[rowIndex].cells).slice(1);
			isDebug && console.log(`sstats: Processing row ${rowIndex} (“${field}”): `, row, dataCells);

			data[field].row = row;
			data[field].unit = row.cells[1].textContent.replace(/^.* /, '');

			dataCells.forEach((td, cellIndex) => {
				if (field === 'time') {
					/* Time parsing copied from `site-specific/strava/shide.js` */
					let tmpDurationInS = 0;
					let hasParsedDuration = true;

					td.textContent.split(/\s([0-9]+\s*[^0-9]+)\s*/).forEach(durationPart => {
						let matches;
						if (durationPart.trim() === '') {
						} else if ((matches = durationPart.match(/^\s*([0-9]+)s/))) {
							tmpDurationInS += parseInt(matches[1], 10);
						} else if ((matches = durationPart.match(/^\s*([0-9]+)m/))) {
							tmpDurationInS += parseInt(matches[1], 10) * 60;
						} else if ((matches = durationPart.match(/^\s*([0-9]+)[hu]/))) {
							tmpDurationInS += parseInt(matches[1], 10) * 3600;
						} else {
							console.log(`sstats: “${td.textContent}”: did not understand duration part “${durationPart}” for td `, td);
							hasParsedDuration = false;
						}
					});

					data[field][cellIndex] = tmpDurationInS;

					isDebug && !hasParsedDuration && console.log(`sstats: Time “${td.textContent}” could not be parsed as a duration.`);
				} else {
					data[field][cellIndex] = parseNumberFromFormattedText(td.textContent);
				}
			});

		});

		const distanceFormatter = new Intl.NumberFormat(document.documentElement.lang, {maximumFractionDigits: 1});
		const elevationGainFormatter = new Intl.NumberFormat(document.documentElement.lang, {maximumFractionDigits: 0});

		/* Add the average distance per activity. */
		const avgDistanceRow = tbody.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'tr');
		avgDistanceRow.appendChild(tbody.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'td')).textContent = 'Avg Distance / Activity';
		data.distance.forEach((distance, i) => {
			const td = avgDistanceRow.appendChild(tbody.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'td'));
			td.textContent = data.numActivities[i] && data.distance[i]
				? `${distanceFormatter.format(data.distance[i] / data.numActivities[i])} ${data.distance.unit}`
				: 'n/a';
		});

		data.distance.row.after(avgDistanceRow);

		/* Add the average elevation gain per activity. */
		const avgElevationGainPerActivityRow = tbody.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'tr');
		avgElevationGainPerActivityRow.appendChild(tbody.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'td')).textContent = 'Avg Elev Gain / Activity';
		data.elevationGain.forEach((elevationGain, i) => {
			const td = avgElevationGainPerActivityRow.appendChild(tbody.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'td'));
			td.textContent = data.numActivities[i] && data.elevationGain[i]
				? `${elevationGainFormatter.format(Math.round(data.elevationGain[i] / data.numActivities[i]))} ${data.elevationGain.unit}`
				: 'n/a';
		});

		data.elevationGain.row.after(avgElevationGainPerActivityRow);

		/* Add the average elevation gain per 100 km or miles. */
		const distanceForAvgElevationGain = 100;
		const avgElevationGainPerDistanceRow = tbody.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'tr');
		avgElevationGainPerDistanceRow.appendChild(tbody.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'td')).textContent = `Avg Elev Gain / ${distanceForAvgElevationGain} ${data.distance.unit}`;
		data.elevationGain.forEach((elevationGain, i) => {
			const td = avgElevationGainPerDistanceRow.appendChild(tbody.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'td'));
			td.textContent = data.numActivities[i] && data.elevationGain[i]
				? `${elevationGainFormatter.format(Math.round(data.elevationGain[i] / (data.distance[i] / distanceForAvgElevationGain)))} ${data.elevationGain.unit}`
				: 'n/a';
		});

		avgElevationGainPerActivityRow.after(avgElevationGainPerDistanceRow);

		/* Add the average speed per activity. */
		const avgSpeedRow = tbody.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'tr');
		avgSpeedRow.appendChild(tbody.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'td')).textContent = 'Avg Speed / Activity';
		data.time.forEach((time, i) => {
			const td = avgSpeedRow.appendChild(tbody.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'td'));
			td.textContent = data.distance[i] && data.time[i]
				? `${distanceFormatter.format(data.distance[i] / data.time[i] * 3600)} ${data.distance.unit}/h`
				: 'n/a';
		});

		data.time.row.after(avgSpeedRow);
	});

	/* Add a style sheet that improves the stats’ readability. */
	if (needsToAddCss) {
		document.head.appendChild(document.createElementNS('http://www.w3.org/1999/xhtml', 'style')).textContent = `
			.sidebar tbody td {
				white-space: pre;
			}

			.sidebar tbody td:not(:first-child) {
				text-align: end;
			}
		`;
	}
})();
