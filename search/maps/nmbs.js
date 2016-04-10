/**
 * Search m.nmbs.be for a Belgian train route.
 *
 * @title NMBS / SNCB / B-Rail / Belgian Railways
 */
(function nmbs() {
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
		s = s.replace(/(^|\s)~(\s|$)/g, '$1' + getSelection() + '$2');
	}

	if (s) {
		s = s.replace(/^\s*(van|from)\s+/g, '');
		s = s.replace(/\s+(naar|to|–)\s+/g, ' to:');

		var locations = s.split(/\s+to\s*:\s*/);

		if (locations.length > 2) {
			window.console && console.log('NMBS: "via" stations not supported yet. Expected 2 locations, got ' + locations.length + '.');
		}

		var url = 'http://www.belgianrail.be/jpm/sncb-nmbs-routeplanner/query.exe/nox?start=1&REQ0JourneyStopsS0A=1%26fromTypeStation%3Dselect%26REQ0JourneyStopsS0F%3DselectStationAttribute%3BGA&REQ0JourneyStopsZ0A=1%26toTypeStation%3Dselect%26REQ0JourneyStopsZ0F%3DselectStationAttribute%3BGA&REQ0JourneyStopsS0G='
			+ encodeURIComponent(locations[0])
			+ '&REQ0JourneyStopsZ0G='
			+ encodeURIComponent(locations[locations.length - 1]);

		/* Make the final URL more readable. */
		location = url
			.replace(/%20/g, '+')
			.replace(/%3A/g, ':')
		;
	}
})();
