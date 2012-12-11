// phantomjs script to retrieve sections data by using humla class model

var system = require('system'),
    page = require('webpage').create();

if (system.args.length === 1) {
	console.log("Usage: get-sections.js <URL>");
	phantom.exit(1);
} else {
	url = system.args[1];
	page.open(url, function(status) {
		if (status === "success") {
			var getSectionsData = function() {
				var data = page.evaluate(function() {
					if (humla && humla.root)
						return JSON.stringify(humla.root.description);
					else
						return null;
				});
				if (!data)
					setTimeout(getSectionsData, 200);
				else {
					console.log(data);
					phantom.exit();
				}
			};
			setTimeout(getSectionsData, 200);
		} else {
			console.log(status);
			phantom.exit(1);
		}
	} );
}

