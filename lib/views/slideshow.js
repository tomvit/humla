
var view_slideshow = {
    enterView : function() {
        humla.controler.fullscreen = true;
    },            

    enterSlide : function(slide) {
        var inx = slide.number - 1;        
        if (inx - 1 >= 0) humla.slides[inx - 1].addClass("previous");
        humla.slides[inx].addClass("current");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].addClass("next");
    },
    
    leaveSlide : function(slide) {
        var inx = slide.number - 1;        
        if (inx - 1 >= 0) humla.slides[inx - 1].removeClass("previous");
        humla.slides[inx].removeClass("current");
        if (inx + 1 < humla.slides.length) humla.slides[inx + 1].removeClass("next");
    }
  
};