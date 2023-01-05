/**
 * Remove all the IFRAMEs that are off-site or do not have a “src” attribute.
 * These are typically used for ads and unwanted external content.
 * navigation etc.
 *
 * IFRAMEs without a “src” attribute are also used for sandboxing untrusted
 * content, e.g. on mailinator.com, but I have not yet found a way to
 * distinguish between src-less IFRAMEs for ads and src-less IFRAMEs for
 * “regular” content. Maybe try to guess based on the dimensions? Meh.
 *
 * @title rm IFRAMEs
 */
(function rmi() {
	/* Keep track of the HTMLDocument instances we have processed. */
	let processed = new Set();

	/**
	 * Is the given node empty-ish? I.e., does it lack child elements and
	 * non-whitespace text?
	 */
	function isEmpty(node) {
		return !node || (!node.childElementCount && (typeof node.textContent !== 'string' || node.textContent.trim() === ''));
	}

	/* The main function. */
	(function execute(document) {
		if (!document || typeof document.querySelectorAll !== 'function' || processed.has(document)) {
			return;
		}

		processed.add(document);

		/* Process all IFRAMEs. */
		Array.from(document.querySelectorAll('iframe:not(#xxxJanConsole)')).forEach(iframe => {
			let shouldDelete = false;
			try {
				shouldDelete = iframe.contentDocument === null || iframe.src === '';
			} catch (e) {
				shouldDelete = true;
			}

			if (shouldDelete) {
				console.log('rm IFRAMEs: found suspicious IFRAME to delete: ', iframe);
				let parentNode = iframe.parentNode;
				iframe.remove();

				while (parentNode && isEmpty(parentNode)) {
					console.log('rm IFRAMEs: found empty parent node to delete: ', parentNode);
					let oldParentNode = parentNode;
					parentNode = parentNode.parentNode;
					oldParentNode.remove();
				}
			} else {
				console.log('rm IFRAMEs: found non-suspicious IFRAME to recurse into: ', iframe);
				execute(iframe.contentDocument);
			}
		});
	})(document);
})();
