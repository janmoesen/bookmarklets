/**
 * Delete CSS rules matching specific conditions, properties, values, …
 *
 * Specify the string to match as a case-insensitive regular expression (no
 * need to wrap it in slashes). Unless you specify beginning (`^`) or end (`$`)
 * anchors, it matches substrings anywhere.
 *
 * Examples:
 * - `delcss user-select`
 * - `delcss font`
 * - `delcss strikethrough`
 * - `delcss @media screen`
 * - `delcss helv.*``
 *
 * @title Delete certain CSS rules
 */
(function delcss() {
	'use strict';

	/* Try to get the parameter string from the bookmarklet/search query.
	 * If none, prompt the user. (Do not use the current text selection.)
	 */
	let s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	if (s === '') {
		s = prompt('Specify the bit of CSS that should be deleted, e.g. `display: none` or `@media screen`.\n\nYour input will be used as a case-insensitive regular expression (no need to prefix and suffix it with slashes).', 'user-select');
	}

	let regexp = new RegExp(s, 'i');

	/**
	 * Delete the given `cssRule` from its parent. Because `processCssRules`
	 * modifies the `cssRules`, the indexes might have changed, so we cannot
	 * rely on the index from the `cssRules.forEach()`.
	 *
	 * Instead, see if the given `cssRule` still has a parent, then retrieve
	 * its current index, and use that for the call to `deleteRule()`.
	 */
	function deleteCssRule(cssRule) {
		const parent = cssRule.parentRule || cssRule.parentStyleSheet;
		if (!parent || !parent.cssRules) {
			return;
		}

		const cssRuleIndex = Array.from(parent.cssRules).indexOf(cssRule);
		if (cssRuleIndex >= 0) {
			parent.deleteRule(cssRuleIndex);
		}
	}

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		function processCssRules(cssRules) {
			Array.from(cssRules).forEach((cssRule, cssRuleIndex) => {
				if (
					cssRule instanceof CSSMediaRule
					|| cssRule instanceof CSSImportRule
					|| cssRule instanceof CSSKeyframeRule
					|| cssRule instanceof CSSCounterStyleRule
					|| cssRule instanceof CSSSupportsRule
					|| cssRule instanceof CSSLayerBlockRule
					|| cssRule instanceof CSSPropertyRule
					|| cssRule instanceof CSSFontFeatureValuesRule
					|| cssRule instanceof CSSFontPaletteValuesRule
				) {
					const atRuleTextToSearch = cssRule.cssText.replace(/\s*\{.*/s, '');
					if (atRuleTextToSearch.match(regexp)) {
						console.log(`delcss: deleting entire at-rule matching ${regexp}: ${atRuleTextToSearch}; cssRule: `, cssRule);
						deleteCssRule(cssRule);
						return;
					}
				}
				if ((cssRule.selectorText ?? '').match(regexp)) {
					console.log(`delcss: deleting entire rule for selector matching ${regexp}: ${cssRule.selectorText}; cssRule: `, cssRule);
					deleteCssRule(cssRule);
					return;
				}

				if (cssRule.style) {
					Array.from(cssRule.style).forEach(property => {
						const value = cssRule.style.getPropertyValue(property);
						const priority = cssRule.style.getPropertyPriority(property);
						let declaration = `${property}: ${value}`;
						if (priority) {
							declaration += ` !${priority}`;
						}

						if (property.match(regexp)) {
							console.log(`delcss: deleting declaration for property matching ${regexp}: ${declaration}; cssRule: `, cssRule);
							cssRule.style.removeProperty(property);
							return;
						} else if (value.match(regexp)) {
							console.log(`delcss: deleting declaration for value matching ${regexp}: ${declaration}; cssRule: `, cssRule);
							cssRule.style.removeProperty(property);
							return;
						} else if (priority.match(regexp)) {
							console.log(`delcss: deleting declaration for priority matching ${regexp}: ${declaration}; cssRule: `, cssRule);
							cssRule.style.removeProperty(property);
							return;
						} else if (declaration.match(regexp)) {
							/* This alone could suffice, but it’s nice to be more specific in the previous `if`/`else` above. */
							console.log(`delcss: deleting declaration matching ${regexp}: ${declaration}; cssRule: `, cssRule);
							cssRule.style.removeProperty(property);
							return;
						}
					});
				}

				if (cssRule.cssRules?.length) {
					/* console.log('delcss: RECURSING for ', cssRule, ' → ', cssRule.cssRules); */
					processCssRules(cssRule.cssRules);
				}
			});
		}

		Array.from(document.styleSheets).forEach(styleSheet => {
			try {
				processCssRules(styleSheet.cssRules)
			} catch (e) {
				console.log('delcss: could not process `cssRules` for style sheet: ', styleSheet, e);
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
