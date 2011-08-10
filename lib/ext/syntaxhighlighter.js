
var ex_syntaxhighlighter = {
    
    inited : false,
    
    initialize : function() {
        if (SyntaxHighlighter && !this.inited) {
            if (this.config.params && this.config.params.defaults)
                for (var i = 0; i < this.config.params.defaults.length; i++)
                    SyntaxHighlighter.defaults[this.config.params.defaults[i].key] = 
                        this.config.params.defaults[i].value; 
            this.inited = true;
        }
    },
    
    processSlide : function(slide) {
        if (!this.inited)
            this.initialize();
        
        if (SyntaxHighlighter) {
            var el = slide.element.getElementsByTagName("pre"), i = 0;
            
            while (i < el.length) {
                if (el[i].className.indexOf("brush") != -1) {
                    var classn = el[i].className;
                    SyntaxHighlighter.highlight(null, el[i]); // this will remove pre, hence don't i++
                } else 
                    i++;
            }
            
        } else
            slide.error("Syntaxhigligher has not been loaded!");
    }
};