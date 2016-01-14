/**
 * Remove the query string from the current page's URL, but keep the hash.
 *
 * @title Remove query
 */
(function rmq() {
	var oldLocation = ('' + location);
	var newLocation = oldLocation.replace(/^([^#]*)\?[^#]*(#.*)?/, '$1$2');

	if (newLocation !== oldLocation) {
		/* See if the user wants to replace the URL without reloading. */
		var s = (function () { /*%s*/; }).toString()
			.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
			.replace(/\*\/\s*\;?\s*\}\s*$/, '')
			.replace(/\u0025s/, '');
		if ((' ' + s + ' ').match(/ --(no|skip)-reload /)) {
			history.pushState({}, document.title, newLocation);
		} else {
			location = newLocation;
		}
	}
})();
