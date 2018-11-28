/**
 * Remove the "required" attribute all form elements, as well as other
 * attributes like "min"/"max" or "maxlength" that restrict input.
 *
 * @title Freeform
 */
(function freeform(document) {
	var attributeNamesToRemove = [
		'required',
		'disabled',
		'readonly',
		'min',
		'max',
		'maxlength',
		'pattern'
	];

	var allowedInputTypes = [
		'text',
		'search',
		'password',
		'checkbox',
		'radio',
		'file',
		'submit',
		'image',
		'reset',
		'button',
	];

	[].forEach.call(document.forms, function (form) {
		[].forEach.call(form.elements, function (element) {
			var changes = [];

			attributeNamesToRemove.forEach(function (attr) {
				if (element[attr] || element.hasAttribute(attr)) {
					console.log('Freeform: remove “' + attr + '” attribute on element: ', element);
					changes.push('Removed “' + attr + '” attribute; was: “' + (element.getAttribute(attr) || element[attr]) + '”');

					delete element[attr];
					element.removeAttribute(attr);
				}

				if (element.tagName.toUpperCase() === 'INPUT') {
					if (element.hasAttribute('type')) {
						var type = element.getAttribute('type').toLowerCase();
						if (type !== '' && allowedInputTypes.indexOf(type) === -1) {
							console.log('Freeform: remove “type” attribute on element: ', element);
							changes.push('Removed “type” attribute; was: “' + element.getAttribute('type') + '” (name: “' + element.name + '”)');

							element.removeAttribute('type');
						}
					}
				}
			});

			if (changes.length) {
				var oldToolTip = element.title;

				var newToolTip = changes.join('\n');

				element.title = oldToolTip
					? oldToolTip + '\n\n' + newToolTip
					: newToolTip;
			}
		});
	});

	/* Recurse for frames and iframes. */
	try {
		[].forEach.call(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]'), function (elem) {
			freeform(elem.contentDocument);
		});
	} catch (e) {
		/* Catch exceptions for out-of-domain access, but do not do anything with them. */
	}
})(document);
