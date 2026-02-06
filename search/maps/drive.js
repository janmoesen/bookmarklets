/**
 * Search Google Maps for a route by car.
 *
 * @title Google Maps (for cars)
 */
(function drive() {
	/* Try to get the parameter string from the bookmarklet/search query.
	   Fall back to the current text selection, if any. If those options
	   both fail, prompt the user.
	*/
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	/**
	 * Get the active text selection, diving into frames and
	 * text controls when necessary and possible.
	 */
	function getActiveSelection(doc) {
		if (arguments.length === 0) {
			doc = document;
		}

		if (!doc || typeof doc.getSelection !== 'function') {
			return '';
		}

		if (!doc.activeElement) {
			return doc.getSelection() + '';
		}

		var activeElement = doc.activeElement;

		/* Recurse for FRAMEs and IFRAMEs. */
		try {
			if (
				typeof activeElement.contentDocument === 'object'
				&& activeElement.contentDocument !== null
			) {
				return getActiveSelection(activeElement.contentDocument);
			}
		} catch (e) {
			return doc.getSelection() + '';
		}

		/* Get the selection from inside a text control. */
		if (typeof activeElement.value === 'string') {
			if (activeElement.selectionStart !== activeElement.selectionEnd) {
				return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
			}

			return activeElement.value;
		}

		/* Get the normal selection. */
		return doc.getSelection() + '';
	}

	let sourceWasSelectedText = false;

	if (s === '') {
		s = getActiveSelection();

		if (s !== '') {
			sourceWasSelectedText = true;
		} else {
			s = prompt('Please enter your Google Maps search:');
		}
	} else {
		s = s.replace(/(^|\s|")~("|\s|$)/g, '$1' + getActiveSelection() + '$2');
	}

	if (s) {
		/* TODO: get the anchor node from the same selection as used by
		 * getActiveSelection(). The following code only looks at the top
		 * document, even though it might look fancier than that. */
		let anchorNode = getSelection()?.anchorNode;
		while (anchorNode && !(anchorNode instanceof HTMLElement)) {
			anchorNode = anchorNode.parentNode;
		}
		const selectedLanguage = (anchorNode?.closest('[lang], [xml\\:lang]') || document.documentElement)?.lang;

		/* Rewrite non-English coordinates as used on Wikipedia to the
		 * English version that Google Maps can parse. Examples below.
		 */
		const localizedCoordinatesLabels = {
			/* English is the default, but if the selection’s language can
			 * be determined, that language will have precedence. */
			en: {
				/* https://en.wikipedia.org/wiki/New_York_City
				 → Before: 40°42′46″N 74°00′22″W
				 ← After:  40°42′46″ N, 74°00′22″ W

				 * https://en.wikipedia.org/wiki/Sydney
			      ← Before: 33°52′04″S 151°12′36″E
			      ← After:  33°52′04″ S, 151°12′36″ E */
				N: ['N'],
				S: ['S'],
				W: ['W'],
				E: ['E'],
			},

			nl: {
				/* https://nl.wikipedia.org/wiki/New_York_(stad)
				 → Before: 40° 43′ NB, 74° 0′ WL
				 ← After:  40° 43′ N, 74° 0′ W

				 * https://nl.wikipedia.org/wiki/Sydney
				 → Before: 33° 52′ ZB, 151° 13′ OL
				 ← After:  33° 52′ S, 151° 13′ E */
				N: ['NB', 'N'],
				S: ['ZB', 'Z'],
				W: ['WL', 'W'],
				E: ['OL', 'O'],
			},

			fr: {
				/* https://fr.wikipedia.org/wiki/New_York
				 → Before: 40° 42′ nord, 74° 00′ ouest
				 ← After:  40° 42′ N, 74° 00′ W

				 * https://fr.wikipedia.org/wiki/Sydney
				 → Before: 33° 51′ 22″ sud, 151° 11′ 33″ est
				 ← After:  33° 51′ 22″ S, 151° 11′ 33″ E */
				N: ['N', 'nord'],
				S: ['S', 'sud'],
				W: ['O', 'ouest'],
				E: ['E', 'est'],
			},

			de: {
				/* https://de.wikipedia.org/wiki/New_York_City
				 → Before: 40° 43′ N, 74° 0′ W
				 ← After:  40° 43′ N, 74° 0′ W

				 * https://de.wikipedia.org/wiki/Sydney
				 → Before: 33° 51′ S, 151° 12′ O
				 ← After:  33° 51′ S, 151° 12′ E */
				N: ['N'],
				S: ['S'],
				W: ['W'],
				E: ['O'],
			},

			es: {
				/* https://es.wikipedia.org/wiki/Nueva_York
				 → Before: 40°42′N 74°00′O
				 ← After:  40°42′ N, 74°00′ W

				 * https://es.wikipedia.org/wiki/S%C3%ADdney
				 → Before: 33°52′04″S 151°12′36″E
				 ← After:  33°52′04″ S, 151°12′36″ E */
				N: ['N'],
				S: ['S'],
				W: ['O'],
				E: ['E'],
			},

			vi: {
				/* https://vi.wikipedia.org/wiki/Th%C3%A0nh_ph%E1%BB%91_New_York
				 → Before: 40°42′46″B 74°00′22″T
				 ← After:  40°42′46″ N, 74°00′22″ W

				 * https://vi.wikipedia.org/wiki/Sydney
				 → Before: 33°51′35,9″N 151°12′40″Đ
				 ← After:  33°51′35.9″S, 151°12′40″E */
				N: ['B'],
				S: ['N'],
				W: ['T'],
				E: ['Đ'],
			},

			ru: {
				/* https://ru.wikipedia.org/wiki/%D0%9D%D1%8C%D1%8E-%D0%99%D0%BE%D1%80%D0%BA
				 → Before: 40°43′42″ с. ш. 73°59′39″ з. д.
				 ← After:  40°43′42″ N, 73°59′39″ W

				 * https://ru.wikipedia.org/wiki/%D0%A1%D0%B8%D0%B4%D0%BD%D0%B5%D0%B9
				 → Before: 33°52′10″ ю. ш. 151°12′30″ в. д.
				 ← After:  33°51′35.9″ S, 151°12′40″ E */
				N: ['с. ш.'],
				S: ['ю. ш.'],
				W: ['з. д.'],
				E: ['в. д.'],
			},
		};

		const possibleReplacements = [];
		for (const [language, labels] of Object.entries(localizedCoordinatesLabels)) {
			/* Prefer the N/S/W/E labels for the selected element’s language. For
			* instance, don’t assume “N” always means “North”; in Vietnamese it
			* stands for “Nam”, meaning “South”. */
			if (language === selectedLanguage) {
				possibleReplacements.unshift({language, labels});
			} else {
				possibleReplacements.push({language, labels});
			}
		}

		const stringRegexpWithPlaceholders = [
			/* Latitude. */
			/(?<latitude>\d+(?:\.\d+)?\s*°(?:\s*\d+\s*′(?:\s*\d+(?:[.,]\d+)?\s*(?:′′|″))?)?)/,
			/* Latitude label, e.g. `N` or `S` (language-dependent). */
			/\s*(?<latitudeLabel>XXX_LAT_XXX)/,

			/* Separator between latitude and longitude: either a comma and zero
			 * or more spaces, or at least one space. */
			/(,\s*|\s+)/,

			/* Longitude. */
			/(?<longitude>\d+(?:\.\d+)?\s*°(?:\s*\d+\s*′(?:\s*\d+(?:[.,]\d+)?\s*(?:′′|″))?)?)/,
			/* Longitude label, e.g. `W` or `E` (language-dependent). */
			/\s*(?<longitudeLabel>XXX_LNG_XXX)/,
		].map(partialRegexp => partialRegexp.source).join('');

		const rewrittenCoordinates = new Set();
		for (let {language, labels} of possibleReplacements) {
			let hasReplaced = false;

			const regexp = new RegExp(
				stringRegexpWithPlaceholders
					.replace('XXX_LAT_XXX', `${labels.N.concat(labels.S).join('|')}`)
					.replace('XXX_LNG_XXX', `${labels.W.concat(labels.E).join('|')}`),
				'g'
			);

			/* This fails on Wikimedia Commons (and possibly other MediaWiki
			 * instances) using LAPI (“Lupo’s API”) from 2009, completely ruining
			 * `String.prototype` methods like `replaceAll`. “Don’t modify objects you
			 * don’t own”, anyone?
			 *
			 * E.g. https://commons.wikimedia.org/wiki/File:Yl%C3%A4pohjarakenteita.jpg
			 * */
			s = s.replaceAll(regexp, (...arguments) => {
				const matchedGroups = arguments.pop();

				/* We found a coordinate pair using the labels for the current
				 * language. Change it to the English notation. */
				hasReplaced = true;
				const rewrittenCoordinate = ''
					+ matchedGroups.latitude.replace(/,/g, '.')
					+ ' '
					+ (labels.N.indexOf(matchedGroups.latitudeLabel) > -1
						? 'N'
						: 'S')
					+ ', '
					+ matchedGroups.longitude.replace(/,/g, '.')
					+ ' '
					+ (labels.W.indexOf(matchedGroups.longitudeLabel) > -1
						? 'W'
						: 'E');

				rewrittenCoordinates.add(rewrittenCoordinate);

				return rewrittenCoordinate;
			});

			if (hasReplaced) {
				/* If we found a match for one language, skip all the others to avoid unintended effects. E.g. N/W/S/E is English */
				break;
			}
		}

		/* If we found one or more coordinate pairs in the text that was
		 * selected, only search for those. That makes it more user-friendly
		 * on sites like Wikipedia where it is hard to select only the
		 * coordinates and not leading text like “Coordinates:” or trailing
		 * utility links like “[mappa]” or “(GeoHackFoo)”. */
		if (sourceWasSelectedText && rewrittenCoordinates.size) {
			s = Array.from(rewrittenCoordinates).join(' to ');
		}

		/* Split the locations list. */
		s = s.replace(/^\s*from\s+/g, 'from:');
		s = s.replace(/\s+(to|–)\s+/g, ' to:');

		if (s.match(/\sto:/) && !s.match(/^\s*from:/)) {
			s = 'from:' + s;
		}

		var locations = s.split(/\s+to\s*:\s*/);

		var url = 'https://www.google.com/maps/';

		if (locations.length === 1) {
			/* If there is just one location, show the normal search results. */
			url += 'search/' + locations.map(encodeURIComponent);
		} else {
			/* If there are several locations, show the directions. See
			   https://mstickles.wordpress.com/2015/06/12/gmaps-urls-options/
			   for more information on what these "data" options mean.
			   Basically: 3e0 = driving, 4e0 = show in km.
			*/
			url += 'dir/data=!4m3!4m2!3e0!4e0/';
			url += locations.map(function (str) {
				return encodeURIComponent(
					str.replace(/^\s*(from|to)\s*:\s*/, '')
				);
			}).join('/');
		}

		/* Make the final URL more readable. */
		location = url
			.replace(/%20/g, '+')
			.replace(/%2C/g, ',')
			.replace(/%3A/g, ':')
		;
	}
})();
