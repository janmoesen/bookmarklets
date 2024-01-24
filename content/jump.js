/**
 * Jump N (default: 30) seconds in the audio and video elements on the page, or
 * jump to a specific time.
 *
 * A positive number jumps forward, a negative number goes back in time.
 *
 * By starting the time with `to `, you can jump to that specific time, e.g. `jump to 35s`.
 *
 * You can also use other units: `h` for hours, and `m` for days. `s` for
 * seconds is implied.
 *
 * @title Jump to time
 */
(function jump() {
	'use strict';
	
	let numSecondsToJump = 30;

	/* Recursively get all video and audio for the document and its sub-documents. */
	function getMedia(document) {
		let allMedia = Array.from(document.querySelectorAll('video, audio'));

		/* Find video and audio inside the shadow DOM of custom elements (Web Components). */
		const notRegularHtmlElementsSelector = 'a,abbr,address,area,article,aside,audio,b,base,bdi,bdo,blockquote,body,br,button,canvas,caption,cite,code,col,colgroup,data,datalist,dd,del,details,dfn,dialog,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,i,iframe,img,input,ins,kbd,label,legend,li,link,main,map,mark,math,math *,menu,meta,meter,nav,noscript,object,ol,optgroup,option,output,p,param,picture,pre,progress,q,rp,rt,ruby,s,samp,script,section,select,slot,small,source,span,strong,style,sub,summary,sup,svg,svg *,table,tbody,td,template,textarea,tfoot,th,thead,time,title,tr,track,u,ul,var,video,wbr'
			.split(',')
			.map(s => `:not(${s})`)
			.join('');

		Array.from(document.querySelectorAll(notRegularHtmlElementsSelector))
			.filter(elem => elem.shadowRoot)
			.forEach(elem => allMedia = allMedia.concat(Array.from(elem.shadowRoot.querySelectorAll('video, audio'))));

		/* Recurse for frames and iframes. */
		try {
			Array.from(
				document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')
			).forEach(
				elem => allMedia = allMedia.concat(getMedia(elem.contentDocument))
			);
		} catch (e) {
			/* Catch exceptions for out-of-domain access, but do not do anything with them. */
		}

		return allMedia;
	}

	let allMedia = getMedia(document);

	/* Make sure there are media elements. */
	if (!allMedia.length) {
		return;
	}

	/* Try to get the parameter string from the bookmarklet/search query.
	 * If there is no parameter, prompt the user. */
	let s = (function () { /*%s*/; }).toString()
		.replace(/^function\s*\(\s*\)\s*\{\s*\/\*/, '')
		.replace(/\*\/\s*\;?\s*\}\s*$/, '')
		.replace(/\u0025s/, '')
		.trim();

	let shouldJumpToSpecificTime = false;

	if (s === '') {
		/* Use the default number of seconds to jump forward. */
	} else if (s === '-') {
		numSecondsToJump = -numSecondsToJump;
	} else {
		let matches = s.match(/^(?:to\s|@)\s*(.*)/);
		if (matches) {
			shouldJumpToSpecificTime = true;
			s = matches[1].trim();
		}

		matches = s.match(/^(-?)\s*(\d+\s*[h:])?\s*(\d+\s*[m:])?\s*(\d+(\.\d+)?\s*(s|))?/);

		if (matches) {
			let isNegative = !!matches[1];
			let numHours = parseInt(matches[2] || 0);
			let numMinutes = parseInt(matches[3] || 0);
			let numSeconds = parseFloat(matches[4] || 0);

			/* The regexp above does not quite work right for times specified
			 * as `MM:SS`, because the logic above puts the `MM` in `numHours`.
			 */
			if (typeof matches[3] === 'undefined' && typeof numHours !== 'undefined') {
				numMinutes = numHours;
				numHours = 0;
			}

			numSecondsToJump = numHours * 3600 + numMinutes * 60 + numSeconds;

			if (isNegative) {
				numSecondsToJump = -numSecondsToJump;
			}
		}
	}

	if (numSecondsToJump || shouldJumpToSpecificTime) {
		let formattedDuration = '';
		let numSecondsForFormatting = Math.abs(numSecondsToJump);

		let numHours = parseInt(numSecondsForFormatting / 3600);
		if (numHours > 0) {
			numSecondsForFormatting -= numHours * 3600;
			formattedDuration += numHours + 'h';
		}

		let numMinutes = parseInt(numSecondsForFormatting / 60);
		if (numHours > 0 || numMinutes > 0) {
			numSecondsForFormatting -= numMinutes * 60;
			formattedDuration += numMinutes + 'm';
		}

		formattedDuration += (numSecondsForFormatting + '').replace(/(\.\d\d)\d*$/, '$1') + 's';

		allMedia.forEach(media => {
			if (shouldJumpToSpecificTime) {
				formattedDuration = '@ ' + formattedDuration;
				media.currentTime = numSecondsToJump;
			} else if (numSecondsToJump < 0) {
				formattedDuration = '- ' + formattedDuration;
				media.currentTime += numSecondsToJump;
			} else {
				formattedDuration = '+ ' + formattedDuration;
				media.currentTime += numSecondsToJump;
			}

			/* Indicate the new playback rate (speed) for the media element. */
			let visibleMediaContainer = media;
			let rect = visibleMediaContainer.getBoundingClientRect();
			while ((rect.height <= 0 || rect.width <= 0) && (visibleMediaContainer = visibleMediaContainer.parentNode)) {
				rect = visibleMediaContainer.getBoundingClientRect();
			}

			const indicator = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
			indicator.textContent = formattedDuration;
			indicator.setAttribute('style', `
				display: flex;
				position: fixed;
				left: ${Math.max(0, rect.left)}px;
				top: ${Math.max(0, rect.top)}px;
				z-index: 10000;
				width: ${rect.width}px;
				height: ${rect.height}px;
				font-size: ${rect.height / 10}px;
				justify-content: center;
				align-items: center;
				color: rgba(0, 0, 0, 1);
				text-shadow: 0 0 10px rgba(255, 255, 255, 1);
				transition: all 0.75s ease-out;
				pointer-events: none;
			`.replace(/^\s*|\s*$/gm, ''));

			document.body.appendChild(indicator);

			/* Animate and remove the indicator. */
			setTimeout(_ => {
				setTimeout( _ => indicator.remove(), 750);

				indicator.setAttribute('style', indicator.getAttribute('style') + `
					font-size: ${rect.height}px;
					color: rgba(0, 0, 0, 0);
					text-shadow: 0 0 10px rgba(255, 255, 255, 0);
				`.replace(/^\s*|\s*$/gm, ''));
			}, 0);
		});
	}
})();
