/**
 * Remove the hash from the current page's URL, but keep the query string.
 *
 * @title Remove hash
 */
(function rmh() {
	var oldLocation = ('' + location);
	var newLocation = oldLocation.replace(/#.*/, '');

	if (newLocation !== oldLocation) {
		location = newLocation;
	}
})();
