/**
 * Convert pace (e.g. “4:38/km”) to speed (e.g. “12.95 km/h”) on a web page.
 *
 * @title Pace2Speed
 */
(function pace2speed() {
	'use strict';

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		const possiblePaceLeafNodes = [];

		Array.from(document.querySelectorAll('body *')).forEach(node => {
			const matches = node.textContent.match(/^\s*(?<minutes>\d+)\s*(:|'|′|min(ute)?s?)\s*(?<seconds>\d+)\s*(''|"|″|sec(ond)?s?)?\s*\/\s*(?<unit>km|mi)/)
				?? node.textContent.match(/^\s*(?<minutes>\d+)\s*:\s*(?<seconds>\d+)\s*(?:min(?:utes?)?)\s*\/\s*(?<unit>km|mi)/);

			if (!matches) {
				return;
			}

			const durationInSeconds = parseInt(matches.groups.minutes, 10) * 60 + parseInt(matches.groups.seconds, 10);
			let speedInKilometersPerHour = 3600 / durationInSeconds;
			if (matches.groups.unit === 'mi') {
				speedInKilometersPerHour *= 1.60934;
			}
			speedInKilometersPerHour = speedInKilometersPerHour.toFixed(1);

			node.setAttribute('xxxJanPace2Speed', speedInKilometersPerHour);
			possiblePaceLeafNodes.push(node);
		});

		/* Replace the text content of the deepest nodes. */
		possiblePaceLeafNodes.forEach(node => {
			if (node.querySelector('[xxxJanPace2Speed]')) {
				return;
			}

			node.textContent = `${node.getAttribute('xxxJanPace2Speed')} km/h`;
		});

		/* Recurse for frames and IFRAMEs. */
		try {
			Array.from(
				document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')
			).forEach(
				elem => execute(elem.contentDocument)
			);
		} catch (e) {
			/* Catch and ignore exceptions for out-of-domain access. */
		}
	}

	execute(document);
})();
