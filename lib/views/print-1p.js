var view_print1p = {
    
    enterView : function() {
	for (var i = 0; i < humla.slides.length; i++) {
            humla.slides[i].process();
        }

        window.__defineGetter__("status", 
            function() {
                for (var i = 0; i < humla.controler.extensions.list.length; i++)
                    for (var j = 0; j < humla.slides.length; j++)
                        if (humla.slides[j].async_cntr[humla.controler.extensions.list[i].config.id] > 0)
                            return "loading...";
                return "loaded";    
            });                        
    },
    
    leaveView : function() {
        window.__defineGetter__("status", function() { return ""; });
    },
    
    enterSlide : function(slide) {
        slide.element.scrollIntoView();
    }
};
