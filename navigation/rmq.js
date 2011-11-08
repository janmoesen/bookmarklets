/**
 * Remove the query string from the current page's URL.
 *
 * @title Remove query
 */
(function rmq() {
	location.search && (location = ('' + location).replace(/\?[^#]*/, ''));
})();
