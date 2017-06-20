// phantomjs script to create pdf from slides

/*console.olog = console.log;
console.log = function(str) {
	this.olog(str);
}*/

var page = require('webpage').create(),
    system = require('system'),
    address, output, size;

   var paperSize2p = { width: '21cm', height: '29.7cm', margin: { top: '12px', left: '8px' } },
       paperSize1p = { width: '29.7cm', height: '21cm', margin: { top: '20px', left: '8px' } };

    address = system.args[1];
    output2p = system.args[2];
    output1p = system.args[3];

    page.viewportSize = { width: 600, height: 600 };

    var maxwaittime = 20000;
    var starttime = new Date().getTime();

    function removeLocalhostHrefs() {
    	page.evaluate(function() {
		var as = document.getElementsByTagName("a");
		for (i = 0; i < as.length; i++) {
			a = as[i];
			//due to the issue in phantomjs 1.1 it is not possible to filiter out only hash-based links
			//href = a.getAttribute("href");
			//if (href.chartAt(0) == "#")
			a.removeAttribute("href");
		}
        });
    }

    function renderPdf(paperSize, removeLHR, zoom, outputFile) {
        page.paperSize = paperSize;

	    if (removeLHR)
          removeLocalhostHrefs();

        page.evaluate(function(zoom) {
            return document.querySelector('body').style.zoom = zoom;
        }, zoom);

        console.log("- Rendering PDF to " + outputFile);
        page.render(outputFile);
    }

    // start with print pdf 2 pages view regardless what was provided on the input
    address = address.replace(/#.*/, "") + "#/1/v4";

    page.open(address, function (status) {
        console.log("- Waiting for Humla controller ready state to be complete...");

	function checkReadyState(waitms) {
        	setTimeout(function () {
            		var readyState = page.evaluate(function () {
                		return humla ? humla.controler.readyState : null;
            		});

            		if ("complete" === readyState) {
                		console.log("- Waiting for all objects to finish loading...");
                                renderWhenReady(300);
            		} else {
                		checkReadyState(100);
            		}
        	}, waitms);
    	}
    	
        function renderWhenReady(waitms) {

            if (new Date().getTime() - starttime > maxwaittime) {
                console.log("- The maximum time " + maxwaittime + "ms to wait for objects was reached!");
		        console.log("- the pdfs will not be rendered!");
                phantom.exit(1);
            }

            setTimeout(function () {
                var acntr = page.evaluate(function () {
                    
		    if (humla.msgbox) 
			humla.msgbox.disable();
		    humla.controler.activateView(3);
		    
		    var cntr = 0;
                    for (i = 0; i < humla.slides.length; i++) {
                       if (humla.slides[i].async_cntr) {
			 if (humla.slides[i].async_cntr.drawing)
                           cntr += humla.slides[i].async_cntr.drawing;
		       }
                    }
                    return cntr;
               });

		    //console.log("Objects remaining: " + acntr + "...");

                if (acntr === 0) {
                    console.log("- All objects loaded in " + (new Date().getTime() - starttime) + "ms.");
                    
                    page.evaluate(function () { humla.controler.activateView(3); });
		            setTimeout(function() {
		                renderPdf(paperSize2p, true, 0.8, output2p);
                        page.evaluate(function () { humla.controler.activateView(4); });
		                setTimeout(function() {
		    	            renderPdf(paperSize1p, false, 0.9, output1p);
                    	    phantom.exit();
		                }, 200)
		            }, 200);

                } else {
                    renderWhenReady(100);
                }
            }, waitms);
        };

	checkReadyState(300);

    });
