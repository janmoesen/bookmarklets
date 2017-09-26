/**
 * Dump the generated HTML of the current page as a plain-text document in a
 * new tab or window.
 *
 * @title Dump HTML
 */
(function dumphtml() {
	/* Use different serializers for different nodes. */
	var stringifiers = {};
	stringifiers[Node.ELEMENT_NODE] = function handleElementNode(node) {
		return node.outerHTML;
	};

	stringifiers[Node.ATTRIBUTE_NODE] = function handleAttributeNode(node) {
		if (typeof console !== 'undefined' && console.debug) {
			console.debug('dump: unexpected ATTRIBUTE_NODE');
		}

		return '<!-- Unhandled ATTRIBUTE_NODE -->';
	};

	stringifiers[Node.TEXT_NODE] = function handleTextNode(node) {
		var tempDiv = document.createElement('div');
		tempDiv.textContent = node.textContent;

		return tempDiv.innerHTML;
	};

	stringifiers[Node.CDATA_SECTION_NODE] = function handleCdataSectionNode(node) {
		return '<![CDATA[' + node.textContent + ']]>';
	};

	stringifiers[Node.ENTITY_REFERENCE_NODE] = function handleEntityReferenceNode(node) {
		if (typeof console !== 'undefined' && console.debug) {
			console.debug('dump: unexpected ENTITY_REFERENCE_NODE');
		}

		return '<!-- Unhandled ENTITY_REFERENCE_NODE -->';
	};

	stringifiers[Node.ENTITY_NODE] = function handleEntityNode(node) {
		if (typeof console !== 'undefined' && console.debug) {
			console.debug('dump: unexpected ENTITY_NODE');
		}

		return '<!-- Unhandled ENTITY_NODE -->';
	};

	stringifiers[Node.PROCESSING_INSTRUCTION_NODE] = function handleProcessingInstructionNode(node) {
		if (typeof console !== 'undefined' && console.debug) {
			console.debug('dump: unexpected PROCESSING_INSTRUCTION_NODE');
		}

		return '<!-- Unhandled PROCESSING_INSTRUCTION_NODE -->';
	};

	stringifiers[Node.COMMENT_NODE] = function handleCommentNode(node) {
		return '<!--' + node.data + '-->';
	};

	stringifiers[Node.DOCUMENT_NODE] = function handleDocumentNode(node) {
		if (typeof console !== 'undefined' && console.debug) {
			console.debug('dump: unexpected DOCUMENT_NODE');
		}

		return '<!-- Unhandled DOCUMENT_NODE -->';
	};

	stringifiers[Node.DOCUMENT_TYPE_NODE] = function handleDocumentTypeNode(node) {
		var docTypeParts = ['DOCTYPE', node.name];

		if (node.publicId) {
			docTypeParts.push('PUBLIC', node.publicId);
		}

		if (node.systemId) {
			docTypeParts.push(node.systemId);
		};
	
		return '<!' + docTypeParts.join(' ') + '>';
	};

	stringifiers[Node.DOCUMENT_FRAGMENT_NODE] = function handleDocumentFragmentNode(node) {
		if (typeof console !== 'undefined' && console.debug) {
			console.debug('dump: unexpected DOCUMENT_FRAGMENT_NODE');
		}

		return '<!-- Unhandled DOCUMENT_FRAGMENT_NODE -->';
	};

	stringifiers[Node.NOTATION_NODE] = function handleNotationNode(node) {
		if (typeof console !== 'undefined' && console.debug) {
			console.debug('dump: unexpected NOTATION_NODE');
		}

		return '<!-- Unhandled NOTATION_NODE -->';
	};

	/* Use an array + join to concatenate all HTML string parts. */
	var htmlParts = [];

	/* Ensure there is a <base href> so relative links keep working. */
	/* TODO: add a check for in-page links (e.g. href="#foo"). Might need
	 * reworking this logic to rewrite all links except those in-page ones,
	 * because the <base href> overrides everything. */
	var baseHref;
	if (document.documentElement.nodeName.toUpperCase() === 'HTML' && !document.querySelector('base[href]')) {
		baseHref = document.createElement('base');
		baseHref.href = document.location;
		document.head.appendChild(baseHref);
	}

	/* Go! */
	Array.prototype.slice.call(document.childNodes).forEach(function (node) {
		if (stringifiers[node.nodeType]) {
			htmlParts.push(stringifiers[node.nodeType](node));
		}
	});

	/* Remove any <base href> added we added. */
	if (baseHref) {
		baseHref.parentNode.removeChild(baseHref);
	}

	var html = htmlParts.join('\n');

	/* Try to open a data: URI in a new tab or window. Firefox 57 and up
	 * (and probably other browsers) disallows scripts to open data: URIs, so
	 * as a fall-back, replace the original document's HTML with our generated
	 * HTML. */
	window.open('data:text/plain;charset=UTF-8,' + encodeURIComponent(html));
	setTimeout(function () {
		document.open();
		document.write('<plaintext>' + html);
		document.close();
	}, 250);
})();
