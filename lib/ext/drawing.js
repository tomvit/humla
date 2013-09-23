
var ex_drawing = {
    
    processSlide : function(slide) {

        var ext = this;
        var processDrawing = function(div) {
            var isrc = "https://docs.google.com/drawings/export/" + 
                ext.getParam(div, "format", ext.config.params.format) + "?id=" + div.id;
            var img = new Image();
            img.style.width = div.style.width;
            img.style.height = div.style.height;
            div.innerHTML = 'Loading picture...';
            img.setAttribute("alt", ext.getParam(div, "alt", ""));
            
            slide.async_cntr[ext.config.id]++;

            // check if there was an error
            img.onerror = function() {
                div.innerHTML = "Error!";
                slide.error("error downloading the drawing from Google with id " + div.id + 
                    ". The drawing may not exist or you do not have persmissions to access it.");
                //div.innerHTML = "Error!";
            };

            // clear info when loaded and add picture to slide
            img.onload = function() {
                div.innerHTML = '';
                div.appendChild(this);
                
                slide.async_cntr[ext.config.id]--;
            };

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
