/**
 * Enable autocompletion on all forms and elements.
 *
 * @title Enable autocomplete
 */
(function frmcomp(document) {
	[].slice.call(document.forms).forEach(function (form) {
		if (form.autocomplete === '' || form.autocomplete === 'off') {
			console.log('Enable autocomplete: enabling on form: ', form);
			form.autocomplete = 'on';
		}

		[].slice.call(form.elements).forEach(function (element) {
			if (element.autocomplete === '' || element.autocomplete === 'off') {
				console.log('Enable autocomplete: enabling on element: ', element);
				element.autocomplete = 'on';
			}
		});
	});

	/* Recurse for frames and iframes. */
	try {
		[].slice.call(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(function (elem) {
			autocomp(elem.contentDocument);
		});
	} catch (e) {
		/* Catch exceptions for out-of-domain access, but do not do anything with them. */
	}
})(document);
