/**
 * Remove the "required" attribute all form elements, as well as other
 * attributes like "min"/"max" or "maxlength" that restrict input.
 *
 * @title Freeform
 */
(function freeform(document) {
	var originalAttributesToPutInToolTip = {
		'name': 'Name',
		'id': 'HTML element ID',
		'type': 'Original type',
		'value': 'Original value',
		'placeholder': 'Original placeholder'
	};

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
			var toolTipLines = [];

			Object.keys(originalAttributesToPutInToolTip).forEach(function (attrName) {
				if (element.hasAttribute(attrName) || element[attrName]) {
					var attrValue = element.getAttribute(attrName) || element[attrName];
					if (attrValue !== null && attrValue !== '') {
						toolTipLines.push(originalAttributesToPutInToolTip[attrName] + ': “' + attrValue + '”');
					}
				}
			});

			attributeNamesToRemove.forEach(function (attrName) {
				if (element.hasAttribute(attrName) || element[attrName]) {
					console.log('Freeform: remove “' + attrName + '” attribute on element: ', element);
					toolTipLines.push('Removed “' + attrName + '” attribute; was: “' + (element.getAttribute(attrName) || element[attrName]) + '”');

					delete element[attrName];
					element.removeAttribute(attrName);
				}
			});

			if (element.tagName.toUpperCase() === 'INPUT') {
				if (element.hasAttribute('type')) {
					var type = element.getAttribute('type').toLowerCase();
					if (type !== '' && allowedInputTypes.indexOf(type) === -1) {
						console.log('Freeform: remove “type” attribute on element: ', element);
						toolTipLines.push('Removed “type” attribute; was: “' + element.getAttribute('type') + '”');

						element.removeAttribute('type');
					}
				}
			}

			if (toolTipLines.length) {
				var oldToolTip = element.title;

				var newToolTip = toolTipLines.join('\n');

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
