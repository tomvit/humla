
var ex_params = {

    processSlide : function(slide) {
        
        // replace parameters with values
        slide.element.innerHTML = slide.element.innerHTML.
		replace(/#SLIDE_NO#/, slide.number).
		replace(/#SLIDE_TOTAL#/, humla.slides.length).
		replace(/#TITLE#/, document.title).
    	replace(/#HUMLA_VERSION#/, HUMLA_VERSION).
        replace(/#LAST_MODIFIED#/, humla.controler.lastModified);   
  
        // find meta_ parameters and replace them with respective metas from the head
        metas = humla.utils.documentHead.getElementsByTagName('meta');
        if (metas.length > 0) {
            var r = new RegExp(".*#META_(.*)#.*"), c = 0;
            while (r.test(slide.element.innerHTML) && c < metas.length) {
                for (var i = 0; i < metas.length; i++) {
                    var an = metas[i].getAttribute('name');
                    if (an !== null && an.toLowerCase() == RegExp.$1.toLowerCase()) {
                        slide.element.innerHTML = slide.element.innerHTML.replace("#META_" + RegExp.$1 + "#", 
                            metas[i].getAttribute('content'));
                    }
                }
                c++;
            }
        }
    }
};  
    