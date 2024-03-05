/**
 * Remove the "required" attribute all form elements, as well as other
 * attributes like "min"/"max" or "maxlength" that restrict input.
 *
 * @title Freeform
 */
(function freeform(document) {
	var originalAttributesToPutInTooltip = {
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
		'button'
	];

	[].forEach.call(document.querySelectorAll('input, textarea, select'), function (element) {
		var tooltipLines = [];

		/* Make sure it is visible. */
		let elementToShow = element;
		while (elementToShow && (!elementToShow.offsetWidth || elementToShow.offsetHeight)) {
			const elementStyle = elementToShow.ownerDocument.defaultView.getComputedStyle(element);

			if (elementStyle.display === 'none') {
				elementToShow.style.display = 'unset';
			}

			if (elementStyle.visibility === 'hidden') {
				elementToShow.style.visibility = 'visible';
			}

			elementToShow = elementToShow.parentElement;
		}

		/* Put the original attribute values in the tooltip. */
		Object.keys(originalAttributesToPutInTooltip).forEach(function (attrName) {
			if (element.hasAttribute(attrName) || element[attrName]) {
				var attrValue = element.getAttribute(attrName) || element[attrName];
				if (attrValue !== null && attrValue !== '') {
					tooltipLines.push(originalAttributesToPutInTooltip[attrName] + ': “' + attrValue + '”');
				}
			}
		});

		/* Remove unwanted attributes. */
		attributeNamesToRemove.forEach(function (attrName) {
			if (element.hasAttribute(attrName) || element[attrName]) {
				console.log('Freeform: remove “' + attrName + '” attribute on element: ', element);
				tooltipLines.push('Removed “' + attrName + '” attribute; was: “' + (element.getAttribute(attrName) || element[attrName]) + '”');

				delete element[attrName];
				element.removeAttribute(attrName);
			}
		});

		if (element.tagName.toUpperCase() === 'INPUT') {
			if (element.hasAttribute('type')) {
				var type = element.getAttribute('type').toLowerCase();

				/* Change unwanted INPUT types to default INPUTs. */
				if (type !== '' && allowedInputTypes.indexOf(type) === -1) {
					console.log('Freeform: remove “type” attribute on element: ', element);
					tooltipLines.push('Removed “type” attribute; was: “' + element.getAttribute('type') + '”');

					element.removeAttribute('type');
				}

				/* Add a click handler to change the value of radio buttons and checkboxes. */
				if (type === 'radio' || type === 'checkbox') {
					console.log('Freeform: add new value prompt on click on element: ', element);

					element.addEventListener('click', function () {
						var newValue = prompt('New value for element ' + (element.name ? '“' + element.name + '”' : '[type="' + type + '"]') + ':', element.value);
						if (newValue !== null) {
							element.value = newValue;
						}
					});
				}

				/* Remove MIME type restriction on file uploads. */
				if (type === 'file') {
					element.removeAttribute('accept');
				}
			}

			/* Change all default (text) INPUTs to multiline TEXTAREAs. */
			if (!element.hasAttribute('type')) {
				var textarea = element.ownerDocument.createElementNS('http://www.w3.org/1999/xhtml', 'textarea');

				textarea.name = element.name;
				textarea.value = element.value;
				textarea.rows = 1;

				if (element.placeholder) {
					textarea.placeholder = element.placeholder;
				}

				if (element.id) {
					textarea.id = element.id;
				}

				element.parentNode.replaceChild(textarea, element);
				element = textarea;

				var computedStyle = getComputedStyle(textarea);
				textarea.style.height = textarea.style.minHeight =
					parseInt(computedStyle.paddingTop || 0, 10)
					+ parseInt(computedStyle.lineHeight || 0, 10)
					+ parseInt(computedStyle.paddingBottom || 0, 10)
					+ 'px';

				tooltipLines.push('Changed from INPUT to TEXTAREA');
			}
		} else if (element.tagName.toUpperCase() === 'SELECT') {
			/* Make sure there is at least one option to change. */
			element.insertBefore(document.createElementNS('http://www.w3.org/1999/xhtml', 'option'), element.firstChild);

			/* Put the original OPTION value in the tooltip. */
			[].forEach.call(element.options, function (option) {
				if (option.hasAttribute('value')) {
					var oldTooltip = option.title;
					var newTooltip = 'Original value: “' + option.getAttribute('value') + '”';

					option.title = oldTooltip
						? oldTooltip + '\n\n' + newTooltip
						: newTooltip;
				}
			});

			/* Allow changing OPTION values. */
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

		/* Create the new tooltip. */
		if (tooltipLines.length) {
			var oldTooltip = element.title;

			var newTooltip = tooltipLines.join('\n');

			element.title = oldTooltip
				? oldTooltip + '\n\n' + newTooltip
				: newTooltip;
		}
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
