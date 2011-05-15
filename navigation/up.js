/**
 * Go to the parent "directory". Note that this function tries to be somewhat
 * smart about it:
 * - If the path ends in a slash, go to the parent directory.
 * - If the path looks like the default index, go to the parent directory and
 *   use the same filename.
 * - For all other paths, go to the containing directory.
 *
 * For example:
 * - "/foo/bar/baz/" becomes "/foo/bar/"
 * - "/foo/bar/baz/index.html" becomes "/foo/bar/index.html"
 * - "/foo/bar/baz" becomes "/foo/bar/" (which in turn will become "/foo/")
 *
 * @title Go up
 * @keyword ..
 */
(function () {
	var parts = location.pathname.split('/');
	if (parts.length === 2) {
		/* If we are in a leaf of the root, always go to "/". This way, */
		/* /foo/index.html will go to /index.html, but /index.html will */
		/* go to /. */
		parts[parts.length - 1] = '';
	} else if (parts[parts.length - 1] === '' ||
	           parts[parts.length - 1].match(/^(default|index)(\..*)?$/)) {
		/* Move the (posibly empty) index filename up one level. */
		parts[parts.length - 2] = parts.pop();
	} else {
		/* Remove the last leaf. */
		parts[parts.length - 1] = '';
	}
	location = parts.join('/');
})();
