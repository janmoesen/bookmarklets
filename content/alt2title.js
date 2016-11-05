/**
 * Set the IMG@title to the IMG@alt attribute. If the image already has a title
 * attribute, separate the title and alt text with a blank line.
 *
 * @title Alt to title
 */
(function alt2title() {
	/* Create a new IFRAME to get a "clean" Window object, so we can use its
	 * console. Sometimes sites (e.g. Twitter) override console.log and even
	 * the entire console object. "delete console.log" or "delete console"
	 * does not always work, and messing with the prototype seemed more
	 * brittle than this. */
	var console = (function () {
		var iframe = document.getElementById('xxxJanConsole');
		if (!iframe) {
			iframe = document.createElement('iframe');
			iframe.id = 'xxxJanConsole';
			iframe.style.display = 'none';

			document.body.appendChild(iframe);
		}

		return iframe && iframe.contentWindow && iframe.contentWindow.console || {
			log: function () { }
		};
	})();


	var processedDocuments = [];

	(function execute(document) {
		/* Recurse for frames and iframes. */
		try {
			[].forEach.call(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]'), function (elem) {
				execute(elem.contentDocument);
			});
		} catch (e) {
			/* Catch exceptions for out-of-domain access, but do not do anything with them. */
		}

		if (processedDocuments.indexOf(document) > -1) {
			return;
		}

		processedDocuments.push(document);
	
		[].forEach.call(document.querySelectorAll('img, input[type="image"], area'), function (element) {
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
		});
	})(document);
})();
