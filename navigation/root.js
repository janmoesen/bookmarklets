/**
 * Go to the root directory, or the Nth directory starting from the root.
 *
 * For example, when you are on "https://www.example.com/foo/bar/baz":
 * - executing "/" goes to "https://www.example.com/"
 * - executing "/ 1" goes to "https://www.example.com/foo/"
 * - executing "/ 2" goes to "https://www.example.com/foo/bar/"
 * - executing "/ quux" goes to "https://www.example.com/quux"
 *
 * @title Go to the root
 * @keyword /
 */
(function () {
	/* Try to get the parameter string from the bookmarklet/search query. */
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	var level = parseInt(s, 10);
	if (s !== '') {
		if (isNaN(level)) {
			return location = '/' + s;
		} else {
			level = Math.max(0, level || 0);
		}
	}

	var parts = document.location.pathname.split('/');
	var newParts = parts.slice(0, (level || 0) + 1);
	if (newParts.length < parts.length) {
		newParts.push('');
	}
	location = newParts.join('/');
})();
