/**
 * Set the IMG@title to the IMG@alt attribute. If the image already has a title
 * attribute, separate the title and alt text with a blank line.
 *
 * @title Alt to title
 */
(function alt2title() {
	var processedDocuments = [];

	(function execute(document) {
		/* Recurse for (i)frames. */
		try {
			Array.from(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(
				elem => { try { execute(elem.contentDocument) } catch (e) { } }
			);
		} catch (e) {
			/* Catch and ignore exceptions for out-of-domain access. */
		}

		if (processedDocuments.indexOf(document) > -1) {
			return;
		}

		processedDocuments.push(document);

		function setTitleForElement(element) {
			if (!element || element.hasBeenProcessedByAlt2Title)
			{
				return;
			}

			var newTitle = '';
			if (element.hasAttribute('title')) {
				newTitle = element.getAttribute('title') + '\n\n';
			}

			if (!element.hasAttribute('alt')) {
				newTitle += '(Missing alt text)';
			} else {
				var alt = element.getAttribute('alt');

				if (alt === '') {
					newTitle += '(Empty alt text)';
				} else {
					newTitle += 'Alt text: “' + alt + '”';
				}
			}

			element.setAttribute('title', newTitle);

			console.log('Alt to title: setting title for ', element, ' to: ', newTitle);

			element.hasBeenProcessedByAlt2Title = true;
		};

		/* Process all existing images. */
		var imageSelector = 'img, input[type="image"], area';
		[].forEach.call(document.querySelectorAll(imageSelector), setTitleForElement);

		/* Add a hover handler for images that may be added in the future. */
		document.addEventListener('mousemove', function (e) {
			var element;
			if (e.target && typeof e.target.closest === 'function' && (element = e.target.closest(imageSelector))) {
				setTitleForElement(element);
			}
		}, false);
	})(document);
})();
