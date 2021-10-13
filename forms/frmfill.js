/**
 * Fill the text inputs with their label contents, their placeholders, titles,
 * names or IDs. Fill other, more specialised inputs, with “sensible” defaults.
 *
 * @title Form fill
 */
(function frmfill() {
	/* See if there are options specified as the parameter to the bookmarklet. */
	let s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	/* “Be liberal in what you accept”: “--only-fill required only” is fine, too. :-) */
	let shouldOnlyFillRequired = s.match(/^(--)?(only[ -])?(fill[ -])?required([ -]only)?$/);

	function execute(document) {
		Array.from(document.querySelectorAll('input, textarea, select')).forEach(input => {
			/* If the input already has a value, bail out. */
			if (input.value !== '') {
				return;
			}

			/* If the input is not required, and we should only fill required inputs, bail out. */
			if (shouldOnlyFillRequired && !(input.required || input.className.match(/required/i))) {
				return;
			}

			/* “Difficult” input types: do not try to do anything. */
			if (['hidden', 'file', 'password', 'color'].indexOf(input.type) > -1) {
				return;
			}
			
			/* Checkboxes and radio buttons: check. */
			if (input.type === 'checkbox' || input.type === 'radio') {
				input.checked = true;
				return;
			}

			/* E-mail inputs: use the host name for a throwaway e-mail address at mailinator.com (using a less common alias). */
			if (input.type === 'email' || [input.name, input.id, input.title, input.placeholder].join(' ').match(/\be-?mail\b/i)) {
				input.value = location.hostname.replace(/^www\./, '') + '@veryrealemail.com';
				return;
			}

			/* Numeric inputs: use the lowest allowed number (or 1). */
			if (input.type === 'number' || input.type === 'range') {
				input.value = input.min === ''
					? 1
					: input.min;
				return;
			}

			/* Date/datetime inputs: use the current date/datetime. */
			if (input.type === 'date') {
				input.valueAsDate = new Date();
				return;
			}

			if (input.type === 'datetime-local' || input.type === 'datetime') {
				input.value = new Date().toISOString().replace(/\..*$/, '');
				return;
			}

			/* Time inputs: use the lowest allowed time (or noon). */
			if (input.type === 'time') {
				input.value = input.min === ''
					? '12:00'
					: input.min;
				return;
			}

			/* All other inputs: use the label, if any. */
			if (input.labels && input.labels[0]) {
				input.value = input.labels[0].textContent
					.trim()
					/* Get rid of the common “*” required indicator. */
					.replace(/(^\*\s*)|(\s*\*$)/, '')
					/* Get rid of the trailing colon in “Label text here:”. */
					.replace(/\s*:$/, '');

				if (input.value !== '') {
					return;
				}
			}

			/* In case there is no label, fall back to other attributes (in decreasing order of usefulness). */
			var attributes = [
				'placeholder',
				'title',
				'name',
				'id'
			];
			
			for (var i = 0; i < attributes.length; i++) {
				var attribute = attributes[i];
				if (input[attribute]) {
					input.value = input[attribute];
					return;
				}
			}
		});

		/* Recurse for (i)frames. */
		try {
			Array.from(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(
				elem => { try { execute(elem.contentDocument) } catch (e) { } }
			);
		} catch (e) {
			/* Catch and ignore exceptions for out-of-domain access. */
		}
	}

	execute(document);
})();
