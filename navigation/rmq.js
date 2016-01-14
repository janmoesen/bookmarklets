/**
 * Remove the query string from the current page's URL, but keep the hash.
 *
 * @title Remove query
 */
(function rmq() {
	var oldLocation = ('' + location);
	var newLocation = oldLocation.replace(/^([^#]*)\?[^#]*(#.*)?/, '$1$2');

	if (newLocation !== oldLocation) {
		location = newLocation;
	}
})();
