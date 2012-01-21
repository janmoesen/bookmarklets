/**
 * Put a bookmarklet's code on GitHub in a TEXTAREA so it is easy to copy.
 *
 * I use this because selecting and copying bookmarklet code to put them in my
 * Safari on iOS is a pain.
 *
 * @title GitHublet
 */
(function githublet() {
	var codeContainer = document.querySelector('.file .lines .highlight');
	if (!codeContainer) {
		alert('No file contents found on page.');
		return;
	}
	
	/* Extract the source code from the separately highlighted lines. */
	var lineContainers = Array.prototype.slice.call(codeContainer.querySelectorAll('.line'));
	if (!lineContainers.length) {
		alert('No lines found in file contents.');
		return;
	}
	var lines = [];
	lineContainers.forEach(function (line) {
		lines.push(line.textContent);
	});
	
	/* Replace the code with a TEXTAREA of more or less the same dimensions. */
	var textarea = document.createElement('textarea');
	textarea.value = 'javascript:' + lines.join('\n');
	var codeContainerStyle = window.getComputedStyle(codeContainer);
	['width', 'height', 'margin', 'padding'].forEach(function (property) {
		if (property === 'width' || property === 'height') {
			textarea.style[property] = codeContainerStyle[property];
		} else {
			['Top', 'Right', 'Bottom', 'Left'].forEach(function (edge) {
				textarea.style[property + edge] = codeContainerStyle[property + edge];
			});
		}
	});
	textarea.style.border = 0;
	textarea.style.lineHeight = lineContainers[0].offsetHeight + 'px';
	var lineContainerStyle = window.getComputedStyle(lineContainers[0]);
	['fontFamily', 'fontSize', 'paddingLeft'].forEach(function (property) {
		textarea.style[property] = lineContainerStyle[property];
	});
	codeContainer.parentNode.replaceChild(textarea, codeContainer);
	textarea.focus();
	textarea.select();
})();
