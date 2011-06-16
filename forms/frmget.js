/**
 * Make all forms use GET.
 *
 * @title Form GET
 */
(function frmget(document) {
	Array.prototype.slice.call(document.forms || document.getElementsByTagName('form')).forEach(function (form) {
		form.method = 'get';
		Array.prototype.slice.call(form.querySelectorAll('input[type="submit"], input[type="image"], button:not([type]), button[type="submit"]')).forEach(function (submit) {
			submit.parentNode.insertBefore(document.createTextNode(' [GET]'), submit.nextSibling);
		});
	});

	/* Recurse for frames and iframes. */
	try {
		Array.prototype.slice.call(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(function (elem) {
			frmget(elem.contentDocument);
		});
	} catch (e) {
		/* Catch exceptions for out-of-domain access, but do not do anything with them. */
	}
})(document);
