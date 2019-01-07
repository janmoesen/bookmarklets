/**
 * Check whether password and probable password confirmation INPUTs have the
 * same value.
 *
 * @title Check passwords
 */
(function checkpass() {
	"use strict";

	function execute(document) {
		let needsStyleSheet = false;

		Array.from(document.querySelectorAll('form input[type="password"]')).forEach(input => {
			if (input.form.xxxJanHasCheckpass) {
				return;
			}

			/* Make sure there are at least two password INPUTs. In case
			 * there are more than two, we assume only the last two to be
			 * “linked”. For instance, on a form to change your password,
			 * there are typically three password INPUTs: your current
			 * password, the new password, and a confirmation for the new
			 * password. On a registration form, there are typically just
			 * two password INPUTs, one for the password, and one for the
			 * confirmation. */
			let allPasswordInputs = Array.from(input.form.querySelectorAll('input[type="password"]'));
			if (allPasswordInputs.length < 2) {
				return;
			}

			let firstIndex = allPasswordInputs.length - 2;
			let secondIndex = allPasswordInputs.length - 1;
			function comparePasswords() {
				if (allPasswordInputs[firstIndex].value === allPasswordInputs[secondIndex].value) {
					allPasswordInputs[firstIndex].classList.remove('xxxJanPasswordMismatch');
					allPasswordInputs[secondIndex].classList.remove('xxxJanPasswordMismatch');
				} else {
					allPasswordInputs[secondIndex].classList.add('xxxJanPasswordMismatch');
					allPasswordInputs[firstIndex].classList.add('xxxJanPasswordMismatch');
				}
			}

			allPasswordInputs[firstIndex].addEventListener('input', comparePasswords);
			allPasswordInputs[secondIndex].addEventListener('input', comparePasswords);
			comparePasswords();

			input.form.xxxJanHasCheckpass = true;

			needsStyleSheet = true;
		});

		/* Add the style sheet for the (mis)matching password INPUTs. */
		if (needsStyleSheet) {
			let styleSheet = document.getElementById('xxxJanCheckpassCss');
			if (!styleSheet) {
				styleSheet = document.createElementNS('http://www.w3.org/1999/xhtml', 'style');
				styleSheet.id = 'xxxJanCheckpassCss';
				styleSheet.textContent = `
					.xxxJanPasswordMismatch {
						background: #f44 !important;
						color: #fff !important;
					}
				`;
				document.head.appendChild(styleSheet);
			}
		}

		/* Recurse for frames and iframes. */
		try {
			Array.from(document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')).forEach(function (elem) {
				execute(elem.contentDocument);
			});
		} catch (e) {
			/* Catch exceptions for out-of-domain access, but do not do anything with them. */
		}
	}

	execute(document);
})();
