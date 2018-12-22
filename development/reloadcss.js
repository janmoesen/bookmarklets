/**
 * Reload all external style sheets.
 *
 * @title Reload CSS
 */
(function reloadcss() {
	/**
	 * Reload the given style sheet by creating a new LINK element with the updated URL.
	 *
	 * @param mixed item Either a StyleSheet or a CSSRule; something with "href" and "media.mediaText".
	 */
	function update(item) {
		if (item.disabled) {
			return;
		}

		var timestamp = +new Date() + '';
		var paramName = 'janbm-date', paramRegex = new RegExp('([?&])' + paramName + '=[0-9]{' + timestamp.length + '}\\b');

		/* Replace the previous timestamp query string parameter, if present. If not, add it. */
		var newHref = item.href.replace(paramRegex, '');
		if(!newHref.match(paramRegex)) {
			newHref += ~newHref.indexOf('?')
				? '&' + paramName + '=' + timestamp
				: '?' + paramName + '=' + timestamp;
		}

		/* Get the full @media rule for the nested style. */
		var tmpItem = item;
		var allMedia = [];
		while (tmpItem) {
			tmpItem.media.mediaText && allMedia.unshift(tmpItem.media.mediaText);
			tmpItem = tmpItem.parentStyleSheet;
		}

		/* Reload the style sheet by creating a new LINK element with the updated URL. */
		var newStyleSheet = document.createElementNS('http://www.w3.org/1999/xhtml', 'link');
		newStyleSheet.rel = 'StyleSheet';
		newStyleSheet.media = allMedia.join(', ');
		newStyleSheet.href = newHref;
		document.head.appendChild(newStyleSheet);
		item.disabled = true;
	}

	Array.prototype.slice.call(document.styleSheets).forEach(function (styleSheet, i) {
		if (!styleSheet.href) {
			/* Inline style sheets can still refer to external style sheets using @import rules. */
			Array.prototype.slice.call(styleSheet.cssRules).forEach(function (cssRule) {
				if (cssRule.type === cssRule.IMPORT_RULE) {
					update(cssRule);
				}
			});
			return;
		}

		update(styleSheet);
	});
})();
