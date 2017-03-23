// phantomjs script to retrieve sections data by using humla class model

var system = require('system'),
    page = require('webpage').create();

if (system.args.length === 1) {
	console.log("Usage: get-sections.js <lecture-file>");
	phantom.exit(1);
} else {
	var lecturefile = system.args[1];

	page.open(lecturefile, function(status) {
		if (status === "success") {
			var getSectionsData = function() {
				var data = evaluate(page, function(lf) {
    					if (humla && humla.root) {
                                                humla.baseURI = lf;
                                                return JSON.stringify(humla.root.contents);
                                        } else
                                                return null;
  				}, lecturefile.replace(/http:\/\/.*\//,""));

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

function evaluate(page, func) {
    var args = [].slice.call(arguments, 2);
    var fn = "function() { return (" + func.toString() + ").apply(this, " + JSON.stringify(args) + ");}";
    return page.evaluate(fn);
}

