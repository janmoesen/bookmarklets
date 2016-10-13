/**
 * Search m.nmbs.be for a Belgian train route.
 *
 * @title NMBS / SNCB / B-Rail / Belgian Railways
 */
(function nmbs() {
	/* Create a new IFRAME to get a "clean" Window object, so we can use its
	 * console. Sometimes sites (e.g. Twitter) override console.log and even
	 * the entire console object. "delete console.log" or "delete console"
	 * does not always work, and messing with the prototype seemed more
	 * brittle than this. */
	var console = (function () {
		var iframe = document.getElementById('xxxJanConsole');
		if (!iframe) {
			iframe = document.createElement('iframe');
			iframe.id = 'xxxJanConsole';
			iframe.style.display = 'none';

			document.body.appendChild(iframe);
		}

		return iframe && iframe.contentWindow && iframe.contentWindow.console || {
			log: function () { }
		};
	})();

	/* Try to get the parameter string from the bookmarklet/search query.
	   Fall back to the current text selection, if any. If those options
	   both fail, prompt the user.
	*/
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');
	if (s === '') {
		s = getSelection() + '' || prompt('Please enter your text:');
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getSelection() + '$2');
	}

	if (s) {
		s = s.replace(/^\s*(van|from)\s+/g, '');
		s = s.replace(/\s+(naar|to|–)\s+/g, ' to:');

		var date;
		s = s.replace(/(^|\s)(?:op|on)\s+([0-9]+(?:[/-][0-9]+){1,2})(\s|$)/, function (str, leadingSpace, dateMatch, trailingSpace) {
				date = dateMatch;
				return leadingSpace + trailingSpace;
		});

		var time;
		s = s.replace(/(^|\s)(?:om|at)\s+((?:(?:[01]?[0-9])|(?:2[0123])):(?:[0-5][0-9]))(\s|$)/, function (str, leadingSpace, timeMatch, trailingSpace) {
				time = timeMatch;
				return leadingSpace + trailingSpace;
		});

		var locations = s.trim().split(/\s+to\s*:\s*/);

		if (locations.length > 2) {
			console.log('NMBS: "via" stations not supported yet. Expected 2 locations, got ' + locations.length + '.');
		}

		var url = 'http://www.belgianrail.be/jpm/sncb-nmbs-routeplanner/query.exe/nox?start=1&REQ0JourneyStopsS0A=1%26fromTypeStation%3Dselect%26REQ0JourneyStopsS0F%3DselectStationAttribute%3BGA&REQ0JourneyStopsZ0A=1%26toTypeStation%3Dselect%26REQ0JourneyStopsZ0F%3DselectStationAttribute%3BGA&REQ0JourneyStopsS0G='
			+ encodeURIComponent(locations[0])
			+ '&REQ0JourneyStopsZ0G='
			+ encodeURIComponent(locations[locations.length - 1]);

		if (date) {
			url += '&REQ0JourneyDate=' + encodeURIComponent(date);
		}

		if (time) {
			url += '&REQ0JourneyTime=' + encodeURIComponent(time);
		}

		/* Make the final URL more readable. */
		location = url
			.replace(/%20/g, '+')
			.replace(/%3A/g, ':')
		;
	}
})();
