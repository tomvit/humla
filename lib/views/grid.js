
var ex_grid = {
    enterView : function(view) {
        for (var i = 0; i < humla.slides.length; i++)
            humla.slides[i].process();
    },
    
    enterSlide : function(slide) {
        slide.element.scrollIntoView();
    }
};