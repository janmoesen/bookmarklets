/**
 * Make all forms on the current page editable.
 *
 * @title Edit forms
 */
(function frmedit() {
	/* The main function. */
	(function execute(document) {
		Array.prototype.slice.call(document.querySelectorAll('form')).forEach(function (form) {
			console.debug(form);

			/* Assemble the list of inputs, their labels and their attributes. */
			var inputs = [];
			Array.prototype.slice.call(form.querySelectorAll('input, select, button')).forEach(function (input) {
				/* Build a CSS-like selector for the current input. */
				var selector = input.tagName.toLowerCase();
				if (input.name) {
					selector += '[name="' + input.name + '"]';
				}
				if (input.id) {
					selector += '#' + input.name + '';
				}
				if (input.className) {
					selector += '.' + input.className.replace(/ /g, '.') + '';
				}

				/* Determine the label for the current input. */
				var label = '';
				var temp = document.querySelector('label[for="' + input.id + '"]');
				if (!temp) {
					temp = input;
					while (temp && temp.tagName && temp.tagName.toLowerCase() !== 'label') {
						temp = temp.parentNode;
					}
				}
				if (temp && temp.tagName && temp.tagName.toLowerCase() === 'label') {
					/* TODO Handle img@alt etc. */
					label = temp.textContent;
				} else if (input.title) {
					label = input.title;
				}
				inputs.push({
					selector: selector,
					label: label,
					input: input
				});

			});

			/* Create the new HTML form. */
			var frag = document.createDocumentFragment(),
			    form = frag.appendChild(document.createElement('form')),
			    style = form.appendChild(document.createElement('style')),
			    table = form.appendChild(document.createElement('table')),
			    tHeadRow = table.createTHead().insertRow(0),
			    tBody = table.appendChild(document.createElement('tbody'));
			style.setAttribute('scoped', 'scoped');
			style.textContent = 'table { border: 1px solid red; } tr:nth-child(odd) { background: #def; } th, td { text-align: left; vertical-align: top; }';
			inputs.forEach(function (input) {
				if (!tHeadRow.childNodes.length) {
					for (var key in input) {
						var th = tHeadRow.appendChild(document.createElement('th'));
						th.setAttribute('scope', 'col');
						th.textContent = key.substring(0, 1).toUpperCase() + key.substring(1);
					}
				}
				var row = tBody.insertRow(-1);
				for (var key in input) {
					if (!row.childNodes.length) {
						var th = row.appendChild(document.createElement('th')), label = th.appendChild(document.createElement('label'));
						th.setAttribute('scope', 'row');
						label.setAttribute('for', 'XXX'); /* XXX TODO */
						label.textContent = input[key];
					} else {
						var cell = row.insertCell(-1);
						cell.textContent = input[key];
					}
				}
			});
			console.debug(frag, table, tHeadRow);
			document.body.appendChild(frag);
		});

		/* Recurse for frames and iframes. */
		try {
			Array.prototype.slice.call(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(function (elem) {
				execute(elem.contentDocument);
			});
		} catch (e) {
			/* Catch exceptions for out-of-domain access, but do not do anything with them. */
		}
	})(document);
})();
