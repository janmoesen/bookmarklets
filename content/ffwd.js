/**
 * Speed up the video and audio playback rate, starting from 10x back to 1x by
 * executing this bookmarklet multiple times. Executing it once more after the
 * normal speed will restart the cycle from the maximum speed again.
 *
 * @title FFWD ⏩
 */
(function ffwd() {
	'use strict';

	const playbackRates = [10, 4, 2, 1.5, 1];

	let playbackRateToUse = undefined;

	/* Recursively execute the logic on the document and its sub-documents. */
	function execute(document) {
		let allMedia = Array.from(document.querySelectorAll('video, audio'));

		/* Find video/audio inside shadow DOMs. */
		const notRegularHtmlElementsSelector = 'a,abbr,address,area,article,aside,audio,b,base,bdi,bdo,blockquote,body,br,button,canvas,caption,cite,code,col,colgroup,data,datalist,dd,del,details,dfn,dialog,div,dl,dt,em,embed,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,i,iframe,img,input,ins,kbd,label,legend,li,link,main,map,mark,math,math *,menu,meta,meter,nav,noscript,object,ol,optgroup,option,output,p,param,picture,pre,progress,q,rp,rt,ruby,s,samp,script,section,select,slot,small,source,span,strong,style,sub,summary,sup,svg,svg *,table,tbody,td,template,textarea,tfoot,th,thead,time,title,tr,track,u,ul,var,video,wbr'
			.split(',')
			.map(s => `:not(${s})`)
			.join('');

		Array.from(document.querySelectorAll(notRegularHtmlElementsSelector))
			.filter(elem => elem.shadowRoot)
			.forEach(elem => allMedia = allMedia.concat(Array.from(elem.shadowRoot.querySelectorAll('video, audio'))));

		allMedia.forEach(media => {
			/* Determine the playback rate to use on all video/audio, based
			 * on the first element encountered. */
			if (typeof playbackRateToUse === 'undefined') {
				for (let i = 0; i < playbackRates.length; i++) {
					if (media.playbackRate >= playbackRates[i]) {
						playbackRateToUse = i === playbackRates.length - 1
							? playbackRates[0]
							: playbackRates[i + 1];
						break;
					}
				}
			}

			media.playbackRate = playbackRateToUse;
		});

		/* Recurse for frames and IFRAMEs. */
		try {
			Array.from(
				document.querySelectorAll('frame, iframe, object[type^="text/html"], object[type^="application/xhtml+xml"]')
			).forEach(
				elem => execute(elem.contentDocument)
			);
		} catch (e) {
			/* Catch and ignore exceptions for out-of-domain access. */
		}
	}

	execute(document);
})();
