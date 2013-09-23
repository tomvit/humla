// phantomjs script to create a slide html page
// it is used for purposes of ajax crawling

var system = require('system'),
    page = require('webpage').create();

if (system.args.length === 1) {
	console.log("Usage: fetch-ajax.js <URL>");
	phantom.exit(1);
} else {
	url = system.args[1];
	page.open(url);

	setTimeout(function() {
		slide = page.evaluate(function () {
			// construct the page with the 'current' slide only
			var html = "<html><head>";
			
			var metas = document.getElementsByTagName('meta');
			for (i = 0; i < metas.length; i++)
				html += "<meta name='" + metas[i].getAttribute('name') + "' content='" + metas[i].getAttribute("content") + "'/>";
			
		 	html += "<title>" + document.title + "</title>";
			html += "</head><body>";
			html += "<div class='slide'>";
			html += document.getElementsByClassName("current")[0].innerHTML;
			html += "</div>";

			html += "</body></html>";
			
			return html;
            	})
		console.log(slide);
		phantom.exit();
	}, 3000);
}

