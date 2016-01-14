/**
 * Remove the hash and query string from the current page's URL.
 *
 * This is the same as "rmqh".
 *
 * @title Remove hash and query
 */
(function rmhq() {
	var oldLocation = ('' + location);
	var newLocation = oldLocation.replace(/[#?].*/, '');

	if (newLocation !== oldLocation) {
		location = newLocation;
	}
})();
