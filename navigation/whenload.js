/**
 * When was this page loaded?
 *
 * @title When loaded?
 */
(function whenload() {
	'use strict';

	const numTimeChars = 12; /* '00:00:00.000'.length; */

	const timeOrigin = Temporal.Instant.fromEpochMilliseconds(Math.trunc(performance.timeOrigin));
	const timeNow = Temporal.Now.instant();

	let isoString = timeOrigin.toZonedDateTimeISO(Temporal.Now.timeZoneId()).toString();

	let [dateString, timeAndTimeZoneString] = isoString.split('T', 2);
	let timeString = timeAndTimeZoneString.slice(0, numTimeChars);
	let timeZoneString = timeAndTimeZoneString.slice(numTimeChars);
	timeZoneString = timeZoneString.replace('[', ' [');

	const timeAgoDuration = timeNow.since(timeOrigin);

	/* Units for the relative time formatter, in descending order for use in
	 * the loop below. (E.g. prefer "2 weeks" over "130,000 seconds").
	 * I use an array of arrays because using `Object.entries()` an object
	 * like `{weeks: 60480, …, minutes: 60}` does not guarantee the order of
	 * the keys. */
	const secondsPerUnit = [
		['weeks', 604800],
		['days', 86400],
		['hours', 3600],
		['minutes', 60]
	];

	let numSecondsElapsed = timeAgoDuration.seconds;
	let valueToUse = numSecondsElapsed;
	let unitToUse = 'seconds';
	for (let [unit, numSeconds] of secondsPerUnit) {
		if (numSecondsElapsed >= 1.5 * numSeconds) {
			unitToUse = unit;
			/* Round down to half, e.g. 100 seconds = 1.5 minutes; 130 seconds = 2 minutes. */
			valueToUse = numSecondsElapsed / numSeconds;
			valueToUse = valueToUse - (valueToUse % 0.5);
			break;
		}
	}

	const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
	const timeAgoString = formatter.format(-valueToUse, unitToUse);

	console.log('whenload: ', {timeOrigin, timeNow, timeAgoDuration});
	alert(`This page was loaded ${timeAgoString}\non ${dateString}\nat ${timeString} ${timeZoneString}`);
})();
