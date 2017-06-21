
var ex_drawing = {
    
    processSlide : function(slide) {

        var ext = this;
        var processDrawing = function(div) {
            var isrc = "https://docs.google.com/drawings/export/" + 
                ext.getParam(div, "format", ext.config.params.format) + "?id=" + div.id;
            var img = document.createElement("img"); 
            img.style.width = div.style.width;
            img.style.height = div.style.height;
            div.innerHTML = 'Loading picture...';
            img.setAttribute("alt", ext.getParam(div, "alt", ""));
            
            slide.async_cntr[ext.config.id]++;

            // check if there was an error
            img.onerror = function() {
		// try to load from local cache if exists
		// local google cache for drawings needs to be created offline by bin/fetchall-drawings.sh
		img.onerror = function() {
			slide.async_cntr[ext.config.id]--;
			div.innerHTML = "Drawing not available";
                	slide.error("error getting the drawing with id " + div.id + ".");
		}
		img.src="/cache/" + div.id + ".png"; // + ext.getParam(div, "format", ext.config.params.format);
		img.style.border = "1px dashed #ececec";
            };

            // clear info when loaded and add picture to slide
            img.onload = function(e) {
                div.innerHTML = '';
                div.appendChild(this);
                
                slide.async_cntr[ext.config.id]--;
            };
            
            // get drawing title
            if (humla.server && humla.server.match('Humla-Server.*')) {
            	var xhr = new XMLHttpRequest();
            	xhr.img = img;
            	xhr.open("GET", "http://humla.vitvar.com/api/drawing/" + div.id + "/title", true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                    	o = JSON.parse(xhr.responseText);
                    	xhr.img.title = o.title;
                    	xhr.img.alt = o.title;
                    }
                }
                xhr.send();            
            }

		    // open editor for google drawing
		    img.ondblclick = function(event) {
			if (event.metaKey)
				window.open("https://docs.google.com/drawings/d/" + div.id + "/edit", "Humla drawing");
	    	}

			// open editor for google drawing
			img.ondblclick = function(event) {
				if (event.metaKey)
					window.open("https://docs.google.com/drawings/d/" + div.id + "/edit", "Humla drawing");
			}

            img.src = isrc;
            
        };

        slide.async_cntr[this.config.id] = 0;
        divs = slide.element.getElementsByClassName('h-drawing');
        for (var i = 0; i < divs.length; i++)
            processDrawing(divs[i]);    
    
    }

};
