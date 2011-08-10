
var ex_latex = {
    
    numLeft : 0,
    
    processSlide : function(slide) {
        var ext = this;
        var processLatex = function(div) {
            var lf = div.innerHTML;
            var isrc = ext.config.params.mathtex + div.innerHTML;
            var img = new Image();

            img.onerror = function(e) {
                slide.error("Error when creating image from the latex formula '" + lf + "'.");
            };
            
            slide.async_cntr[ext.config.id]++;            
            img.onload = function() {
                div.innerHTML = '';
                div.appendChild(this);
                slide.async_cntr[ext.config.id]--;
            };
            
            img.src = isrc;
        };
    
        slide.async_cntr[this.config.id] = 0;
        divs = slide.element.getElementsByClassName('h-latex');
        for (var i = 0; i < divs.length; i++)
            processLatex(divs[i]);

    }

};
