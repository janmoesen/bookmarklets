/**
 * Show a minimal HTML page linking to the current page.
 *
 * @title Link this
 */
(function link() {
	/* Try to get the parameter string from the bookmarklet/search query. */
	var s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '');

	if (s && !s.match(/^[a-zA-Z][-+.a-zA-Z0-9]*:/)) {
		s = 'https://' + s;
	}

	/**
	 * Get the active text selection, diving into frames and
	 * text controls when necessary and possible.
	 */
	function getActiveSelection(doc) {
		if (arguments.length === 0) {
			doc = document;
		}

		if (!doc || typeof doc.getSelection !== 'function') {
			return '';
		}

		if (!doc.activeElement) {
			return doc.getSelection() + '';
		}

		var activeElement = doc.activeElement;

		/* Recurse for FRAMEs and IFRAMEs. */
		try {
			if (
				typeof activeElement.contentDocument === 'object'
				&& activeElement.contentDocument !== null
			) {
				return getActiveSelection(activeElement.contentDocument);
			}
		} catch (e) {
			return doc.getSelection() + '';
		}

		/* Get the selection from inside a text control. */
		if (typeof activeElement.value === 'string') {
			if (activeElement.selectionStart !== activeElement.selectionEnd) {
				return activeElement.value.substring(activeElement.selectionStart, activeElement.selectionEnd);
			}

			return activeElement.value;
		}

		/* Get the normal selection. */
		return doc.getSelection() + '';
	}

	function normalize(str) {
		return str.replace(/\s\s+/g, ' ').trim();
	}

	var titleText = normalize(s);
	if (!titleText) {
		var possibleTitleTexts = [];

		var metaTitleElement = document.querySelector('meta[property="og:title"], meta[property="twitter:title"], meta[name="title"]');
		if (metaTitleElement && metaTitleElement.content) {
			possibleTitleTexts.push(normalize(metaTitleElement.content));
		}

		var titleElement = document.querySelector('title');
		if (titleElement && titleElement.textContent) {
			possibleTitleTexts.push(normalize(titleElement.textContent));
		}

		possibleTitleTexts.push(normalize(document.title));

		titleText = possibleTitleTexts.sort((a, b) => a.length < b.length)[0];
	}

	if (!titleText) {
		titleText = location + '';
	}

	var originalIconLink = s || document.querySelector('link[rel~="icon"]');

	/* Build a basic HTML document for easy element access. */
	var root = document.createDocumentFragment().appendChild(document.createElementNS('http://www.w3.org/1999/xhtml', 'html'));
	root.innerHTML = `
		<title></title>

		<link rel="icon"/>

		<style>
		html {
			font-family: "Calibri", sans-serif;
		}

		img {
			max-width: 32px;
			max-height: 32px;
		}

		textarea {
			width: 100%;
			min-height: 30ex;
			padding: 1ex;
			border: 1px dotted grey;
		}

		input[type="url"] {
			width: 100%;
		}

		</style>

		<p>
			<img/> <span><a></a></span>
		</p>

		<p>
			Link code:<br/>
			<textarea rows="10" cols="80"></textarea>
		</p>

		<p class="xxxJanExcludeFromDataUri">
			Data URI for this link page:<br/>
			<input type="url"/ onfocus="select()" readonly>
		</p>

		<p class="xxxJanExcludeFromDataUri">
			<button>Restore original page</button>
		</p>

		<script>
		(function () {
			const textarea = document.querySelector('textarea');
			if (textarea) {
				textarea.style.height = textarea.scrollHeight + 'px';
			}
		})();
		</script>
	`;

	var title = root.querySelector('title');
	var iconLink = root.querySelector('link');
	var styleSheet = root.querySelector('style');
	var iconImage = root.querySelector('img');
	var link = root.querySelector('a');
	var textarea = root.querySelector('textarea');

	/* Link to the current page using its title. */
	link.href = s || location;
	link.textContent = title.textContent = s || titleText;
	var domain = (s && link.hostname) || document.domain || location.hostname;
	if (domain) {
		link.parentNode.insertBefore(document.createTextNode(` [${domain}]`), link.nextSibling);
	}

	/* Link to the current page's referrer, if available. */
	if (document.referrer) {
		var viaLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
		viaLink.setAttribute('href', document.referrer);
		viaLink.textContent = viaLink.hostname || viaLink.href;
		link.parentNode.parentNode.appendChild(document.createTextNode(' (via '));
		link.parentNode.parentNode.appendChild(viaLink);
		link.parentNode.parentNode.appendChild(document.createTextNode(')'));
	}

	/* Make sure the favicon HREF is absolute. If there was none, use Google S2. */
	iconLink.href = iconImage.src = originalIconLink && originalIconLink.href || 'https://www.google.com/s2/favicons?domain=' + (domain || link.hostname || 'example.com');

	/* Show the link code in various formats inside an editable TEXTAREA. */
	textarea.textContent = 'Plain text:\n"' + link.textContent + '": ' + link.href;
	var selectedText = getActiveSelection();
	if (selectedText) {
		textarea.textContent += '\n“' + selectedText.trim() + '”';
	}

	textarea.textContent += '\n\nHTML:\n' + link.parentNode.innerHTML;

	textarea.textContent += '\n\nMarkdown:\n[' + link.textContent + '](' + link.href + ')';

	/* Remember the original document (as a string of the current HTML, so
	 * without event handlers added in JavaScript, etc.) so we can restore it
	 * later on, if wanted.
	 */
	var originalHtml = document.documentElement.outerHTML;

	/* Replace the original document's HTML with our generated HTML. */
	HTMLDocument.prototype.open.call(document, 'text/html; charset=UTF-8');
	HTMLDocument.prototype.write.call(document, '<!DOCTYPE html>' + root.outerHTML);
	HTMLDocument.prototype.close.call(document);

	/* Because the document fragment was serialized and then imported using
	 * `document.write()`, we can no longer use the original `textarea`
	 * variable to refer to the TEXTAREA as currently visible on our page.
	 */
	const currTextarea = document.querySelector('textarea');

	/* Show the data URI for this link page. */
	const dataUriInput = document.querySelector('input[type="url"]');
	function updateDataUri() {
		const domCopy = document.documentElement.cloneNode(true);
		Array.from(domCopy.querySelectorAll('.xxxJanExcludeFromDataUri')).forEach(node => node.remove());
		domCopy.querySelector('textarea').textContent = currTextarea.value;
		dataUriInput.value = 'data:text/html;charset=UTF-8,' + encodeURIComponent('<!DOCTYPE html>' + domCopy.outerHTML);
	}

	updateDataUri();

	/* Update the data URI when the TEXTAREA is changed. I use it to jot down
	 * quick notes, and want to preserve those notes in the generated URI.
	 */
	currTextarea.addEventListener('input', updateDataUri);

	/* Restore the original document’s HTML by clicking a button. This is
	 * not a 100% correct restoration, but it’s faster than reloading, which
	 * still remains an option if the result is not satisfactory.
	 */
	var button = document.querySelector('button');
	button.textContent = 'Restore original page';
	button.onclick = function () {
		HTMLDocument.prototype.open.call(document, 'text/html; charset=UTF-8');
		HTMLDocument.prototype.write.call(document, originalHtml);
		HTMLDocument.prototype.close.call(document);
	};
})();
