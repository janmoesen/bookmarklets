/**
 * Convert password inputs to normal text inputs and back again.
 *
 * @title Show passwords
 */
(function showpass(document) {
	Array.prototype.slice.call(document.querySelectorAll('input:not([type]), input[type="text"], input[type="password"]')).forEach(function (input) {
		if (input.type === 'password') {
			input.wasPassword = true;
			input.type = 'text';
		} else if (input.wasPassword) {
			input.type = 'password';
		}
	});

	/* Recurse for frames and iframes. */
	try {
		Array.prototype.slice.call(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(function (elem) {
			showpass(elem.contentDocument);
		});
	} catch (e) {
		/* Catch exceptions for out-of-domain access, but do not do anything with them. */
	}
})(document);
