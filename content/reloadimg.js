/**
 * Reload all images in the document.
 *
 * @title Reload images
 */
(function reloadimg() {
	'use strict';

	let isDebug = true;

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		/**
		 * Update the given URL so it can be reloaded.
		 *
		 * It adds a “cache-busting” query string parameter, `_cache_buster_`.
		 *
		 * @return URL
		 */
		function updateUrl(url) {
			isDebug && console.log(`reloadimg: old URL: ${url}`);
			if (!(url instanceof URL)) {
				url = new URL(url);
			}

			url.searchParams.set('_cache_buster_', +new Date());
			isDebug && console.log(`reloadimg: new URL: ${url}`);

			return url;
		}

		/* Normal images (`img`). */
		document.querySelectorAll('img').forEach(
			img => img.src = updateUrl(img.src)
		);

		/* SVG images (`image` inside `svg`) */
		document.querySelectorAll('svg image').forEach(
			image => image.setAttribute('href', updateUrl(image.getAttribute('href')))
		);

		/* Process known CSS image properties in CSS… */
		const cssPropertiesToUpdate = ['background-image', 'border-image', 'list-style-image', 'mask-image'];

		/* … in `style` attributes, */
		/* TODO: document.querySelectorAll('[style]').forEach(element => … */

		/* … and in style sheets. */
		Array.from(document.styleSheets).forEach(styleSheet => {
			try {
				Array.from(styleSheet.cssRules).forEach(cssRule => {
					if (!(cssRule instanceof CSSStyleRule)) {
						return;
					}

					cssPropertiesToUpdate.forEach(cssPropertyName => {
						window.cssRule = cssRule;
						const cssPropertyValue = cssRule.style[cssPropertyName];
						if (
							typeof cssPropertyValue === undefined
							|| cssPropertyValue === ''
							|| cssPropertyValue === 'none'
							|| cssPropertyValue === 'unset'
						) {
							return;
						}

						/* This naive regexp does not take into account CSS escaping inside unquoted arguments to `url()`/`src()`. */
						const newCssPropertyValue = cssPropertyValue.replaceAll(/((url|src)\((["']?))([^)]+)(\3\)\))/g, (fullUrlOrSrcComponent, prefix, urlOrSrcFunction, openingOptionalQuotationMark, actualUrlValue, suffix, closingOptionalQuotationMark) => {
							if (actualUrlValue.slice(0, 5) === 'data:') {
								return;
							}

							isDebug && console.log(cssRule, `has ${cssPropertyName}: `, cssRule.style[cssPropertyName], '⇒ ', actualUrlValue);

							return [
								prefix,
								updateUrl(new URL(actualUrlValue, styleSheet.href)),
								suffix
							].join('');
						});

						if (newCssPropertyValue !== cssPropertyValue) {
							isDebug && console.log(`Old CSS property value for ${cssPropertyName}: ${cssPropertyValue}`);
							isDebug && console.log(`New CSS property value for ${cssPropertyName}: ${newCssPropertyValue}`);
							cssRule.style.setProperty(cssPropertyName, newCssPropertyValue);
						}
					});
				})
			} catch (e) {
				isDebug && console.log('reloadimg: caught exception while getting cssRules for ', styleSheet, e);
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
