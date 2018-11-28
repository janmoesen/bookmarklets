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

				/* Change all default (text) INPUTs to multiline TEXTAREAs. */
				if (!element.hasAttribute('type')) {
					var textarea = element.ownerDocument.createElement('textarea');

					textarea.name = element.name;
					textarea.value = element.getAttribute('value');
					textarea.rows = 1;

					if (element.placeholder) {
						textarea.placeholder = element.placeholder;
					}

					element.parentNode.replaceChild(textarea, element);
					element = textarea;

					var computedStyle = getComputedStyle(textarea);
					textarea.style.height = parseInt(computedStyle.paddingTop || 0, 10)
						+ parseInt(computedStyle.lineHeight || 0, 10)
						+ parseInt(computedStyle.paddingBottom || 0, 10)
						+ 'px';

					toolTipLines.push('Changed from INPUT to TEXTAREA');
				}
			} else if (element.tagName.toUpperCase() === 'SELECT') {
				/* Make sure there is at least one option to change. */
				element.insertBefore(document.createElement('option'), element.firstChild);

				[].forEach.call(element.options, function (option) {
					if (option.hasAttribute('value')) {
						var oldToolTip = option.title;
						var newToolTip = 'Original value: “' + option.getAttribute('value') + '”';

						option.title = oldToolTip
							? oldToolTip + '\n\n' + newToolTip
							: newToolTip;
					}
				});

				element.addEventListener('change', function (event) {
					var option = element.options[element.selectedIndex];
					var newValue = prompt('New value for option ' + element.selectedIndex + ' (“' + (option.textContent || option.value) + '”):', option.value);
					if (newValue !== null) {
						if (newValue !== option.value) {
							option.textContent = newValue;
						}

						option.value = newValue;
					}
				});
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
