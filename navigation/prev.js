/**
 * Go to the previous page. To do so, this bookmarklet will look:
 * - for <link rel="prev"> or <a rel="prev">
 * - for links whose text contains "Previous", ">>", etc.
 *   e.g. <a href="/bla">Previous</a>
 * - for links whose (or their parents') ID or class contains "prev"
 * - at the URL to see if there is a date, and increases that
 * - at the URL to see if there is a number, and increases that
 * - for links whose previous sibling's text contains "Previous", ">>", etc.
 *   e.g. « <a href="/bla">Whatever</a>
 *
 * @title « Previous
 * @todo Make month and day optional for URL-based dates.
 * @todo Support multiple locales and cases for URL-based months.
 */
(function prev() {
	var symbols = [
		'<<',
		'«',
		'←',
		'⇐',
		'⎗'
	];

	var keywords = symbols.concat([
		'PREVIOUS',
		'Previous',
		'previous',
		'PREV!PREVIEW',
		'Prev!Preview',
		'prev!preview',
		'OLDER!FOLDER',
		'Older!Folder',
		'older!folder',
		'VORIGE',
		'Vorige',
		'vorige',
		'OUDER',
		'Ouder',
		'ouder',
		'PRECEDENT',
		'PRÉCÉDENT',
		'Précédent',
		'précédent',
	]);

	var identifiers = [
		'prev',
		'previous',
		'prevArticle',
		'previousArticle',
		'prevPost',
		'previousPost',
		'prevLink',
		'previousLink',
		'navi-prev'
	];

	var monthNames = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];

	var selectors;
	var newUrl;

	/* Try links with @rel="prev". */
	selectors = [
		'link[rel="prev"][href]:not([href="#"]), a[rel="prev"][href]:not([href="#"])'
	];

	/* Look for typical ID/class names on the links. */
	identifiers.forEach(function (idOrClass) {
		selectors.push('a#' + idOrClass + ':not([href="#"])');
		selectors.push('a.' + idOrClass + ':not([href="#"])');
	});

	/* Look for tell-tale text content inside links, or in their tooltips. */
	keywords.forEach(function (text) {
		var mustContain = text.replace(/!.*/, '');
		var mustNotContain = mustContain !== text && text.replace(/.*!/, '');
		var selector = '//a[@href][@href != "#"][not(starts-with(@href, "javascript:"))][contains(., "' + mustContain + '") and string-length(normalize-space(substring-before(., "' + mustContain + '"))) < 8]';

		if (mustNotContain) {
			selector += '[not(contains(., "' + mustNotContain + '"))]';
		}

		selectors.push(selector);

		var titleSelector = 'a[href]:not([href="#"]):not([href^="javascript:"])[title*="' + mustContain + '"]';

		if (mustNotContain) {
			titleSelector += ':not([title*="' + mustNotContain + '"])';
		}

		selectors.push(titleSelector);
	});

	/* Look for tell-tale text content inside image ALT text for links that have no text content. */
	keywords.forEach(function (text) {
		var mustContain = text.replace(/!.*/, ''), mustNotContain = mustContain !== text && text.replace(/.*!/, '');
		var selector = '//a[@href][string(.) = ""][img[contains(@alt, "' + mustContain + '")]]';

		if (mustNotContain) {
			selector += '[not(img[contains(@alt, "' + mustNotContain + '")])]';
		}

		selectors.push(selector);
	});

	/* Look for tell-tale text content inside image source URLs for links that have no text content. */
	keywords.forEach(function (text) {
		var mustContain = text.replace(/!.*/, ''), mustNotContain = mustContain !== text && text.replace(/.*!/, '');
		var selector = '//a[@href][string(.) = ""][img[contains(@src, "' + mustContain + '")]]';

		if (mustNotContain) {
			selector += '[not(img[contains(@src, "' + mustNotContain + '")])]';
		}

		selectors.push(selector);
	});

	/**
	 * Loop through the given selectors.
	 *
	 * @param array selectors
	 * @return string The matching selector's destination URL, if any.
	 */
	function processSelectors(selectors) {
		function getLastXPathResult(result) {
			return result.snapshotItem(result.snapshotLength - 1);
		}

		for (var link, i = 0; i < selectors.length; i++) {
			/* Prefer the last node because it is more likely to be a navigation link. 100% fact. */
			link = selectors[i].substring(0, 2) === '//'
				? getLastXPathResult(document.evaluate(selectors[i], document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null))
				: Array.prototype.slice.call(document.querySelectorAll(selectors[i])).pop();

			if (link) {
				console.log('« Previous: Matching selector: ' + selectors[i] + '\nFound link: ', link);
				return link.href;
			}
		}
	}

	/* Check the "highly likely" selectors we have so far. */
	if ((newUrl = processSelectors(selectors))) {
		location = newUrl;
		return;
	}

	/* Check for a date in the URL. */
	var uri = decodeURIComponent(location.pathname + location.search + location.hash);
	var yearPattern = '20[0-9][0-9]';
	var monthPattern = monthNames.concat(['(?:0?[1-9])', '(?:1[012])']).join('|');
	var dayPattern = '(?:' + ['3[01]', '[12][0-9]', '0?[1-9]'].join(')|(?:') + ')';
	var regexp = new RegExp('(.*?\\b)(' + yearPattern + ')([-/_.]?)(' + monthPattern + ')\\3(' + dayPattern + ')([^0-9].*)?$');

	var matches;

	if ((matches = uri.match(regexp))) {
		var prefix = matches[1];
		var year = matches[2];
		var separator = matches[3];
		var month = matches[4];
		var day = matches[5];
		var suffix = typeof matches[6] === 'undefined'
			? ''
			: matches[6];

		var newDate = new Date(Date.UTC(
			parseInt(year, 10),
			month.length === 3
				? monthNames.indexOf(month)
				: parseInt(month, 10) - 1,
			parseInt(day, 10)
		) - 24 * 60 * 60 * 1000);

		var newYear = newDate.getUTCFullYear();
		var newMonth = month.length === 3
			? monthNames[newDate.getUTCMonth()]
			: newDate.getUTCMonth() + 1;
		var newDay = newDate.getUTCDate();

		if (newMonth < 10 && month.length === 2) {
			newMonth = '0' + newMonth;
		}

		if (newDay < 10 && day.length === 2) {
			newDay = '0' + newDay;
		}

		newUrl = prefix + newYear + separator + newMonth + separator + newDay + suffix;
		console.log('« Previous: Matching date in URL: ', [year, month, day], '\nCalculated URL: ', newUrl);
		location = newUrl;
		return;
	}

	/* Check for a number in the URL. */
	if ((matches = uri.match(/(.*?)([0-9]+)([^0-9]*)$/))) {
		var number = parseInt(matches[2], 10);
		var newNumber = number - 1;

		if (matches[2].substring(0, 1) === '0' && (newNumber + '').length < matches[2].length) {
			newNumber = (Math.pow(10, matches[2].length) + '').substring(1 + (newNumber + '').length) + newNumber;
		}

		newUrl = matches[1] + newNumber + matches[3];
		console.log('« Previous: Matching number in URL; going from ', matches[2], ' to ', newNumber, '\nCalculated URL: ', newUrl);
		location = newUrl;
		return;
	}

	/* We did not found anything using the "highly likely" selectors, so start over with "not completely improbable" selectors. */
	selectors = [];

	/* Look for tell-tale symbols next to links. */
	symbols.forEach(function (text) {
		selectors.push('//*[contains(text(), "' + text + '") and substring-after(text(), "' + text + '") = ""]//preceding-sibling::a');
	});

	/* Look for typical ID/class names on the links' parents. */
	identifiers.forEach(function (idOrClass) {
		selectors.push('#' + idOrClass + ' > a');
		selectors.push('.' + idOrClass + ' > a');
	});

	/* Now check the selectors we are less confident about. */
	if ((newUrl = processSelectors(selectors))) {
		location = newUrl;
		return;
	}

	/* Alert the user by flashing the title bar. */
	var numCycles = 0;

	var icons = [
		'◻',
		'◼'
	];

	if (typeof document.janOriginalTitle === 'undefined') {
		document.janOriginalTitle = document.title;
	}

	(function flash() {
		if (numCycles < 6) {
			document.title = icons[numCycles % icons.length] + ' No previous page? ' + icons[(numCycles + 1) % icons.length];
			window.setTimeout(flash, 500);
		} else {
			document.title = document.janOriginalTitle;
		}

		numCycles++;
	})();
})();
