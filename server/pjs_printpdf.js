// phantomjs script to create pdf from slides

var page = require('webpage').create(),
    system = require('system'),
    address, output, size;

    address = system.args[1];
    output = system.args[2];
    orient = system.args[3];

    page.viewportSize = { width: 600, height: 600 };
    if (orient == "portrait") {
    	page.paperSize = { format: 'A4', orientation: 'portrait', margin: '2.3cm' };
    	page.zoomFactor = 1.5;
    } else {
	page.paperSize = { format: 'A4', orientation: 'landscape', margin: '2.3cm' };
        page.zoomFactor = 1.5;
    }

    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit();
        } else {
            window.setTimeout(function () {
                page.render(output);
                phantom.exit();
            }, 3000);
        }
    });
