/**
 * When was this page loaded?
 *
 * @title When loaded?
 */
(function whenload() {
	'use strict';

	const numTimeChars = 12; /* '00:00:00.000'.length; */

	const timeOrigin = Temporal.Instant.fromEpochMilliseconds(performance.timeOrigin);
	const timeNow = Temporal.Now.instant();

	let isoString = timeOrigin.toZonedDateTimeISO(Temporal.Now.timeZoneId()).toString();

	let [dateString, timeAndTimeZoneString] = isoString.split('T', 2);
	let timeString = timeAndTimeZoneString.slice(0, numTimeChars);
	let timeZoneString = timeAndTimeZoneString.slice(numTimeChars);
	timeZoneString = timeZoneString.replace('[', ' [');

	const timeAgoString = timeNow.since(timeOrigin).toLocaleString();

	alert(`This page was loaded\n${timeAgoString} ago\non ${dateString}\nat ${timeString} ${timeZoneString}`);
})();
