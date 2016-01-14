/**
 * Remove the query string and hash from the current page's URL.
 *
 * This is the same as "rmhq".
 *
 * @title Remove query and hash
 */
(function rmqh() {
	var oldLocation = ('' + location);
	var newLocation = oldLocation.replace(/[#?].*/, '');

	if (newLocation !== oldLocation) {
		location = newLocation;
	}
})();
