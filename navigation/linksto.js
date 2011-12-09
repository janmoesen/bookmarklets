(function () {
	var all = document.querySelectorAll('[href^="http://jan.moesen.nu"], [href^="//jan.moesen.nu"], [src^="http://jan.moesen.nu"], [src^="//jan.moesen.nu"], [src*="janmoesen"]');
	document.janbmLinksToIndex = ~~document.janbmLinksToIndex + 1;
	console.debug('before: ', document.janbmLinksToIndex);
	if (document.janbmLinksToIndex >= all.length) {
		document.janbmLinksToIndex = 0;
	}
	console.debug('after: ', document.janbmLinksToIndex);
	console.debug('element: ', all[document.janbmLinksToIndex]);
	all[document.janbmLinksToIndex] && all[document.janbmLinksToIndex].scrollIntoView();
})()
