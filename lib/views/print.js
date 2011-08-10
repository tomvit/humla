var view_print = {
    
    enterView : function() {
        for (var i = 0; i < humla.slides.length; i++)
            if (humla.slides[i].number % 2 === 0) 
                humla.slides[i].addClass("even");
            else
                humla.slides[i].addClass("odd");
                
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