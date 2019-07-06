/*
    Humla - HTML5 presentation environment
    Tomas Vitvar, tomas@vitvar.com
    
    core humla classes
*/

/**
 * Slide Class
 * @constructor
 */
Slide = function(element, footer, section, number) {

    // html element of the slide
    this.element = element;
    
    // section to which the slide belongs
    this.section = section;
    
    // sequential number of this slide
    this.number = number;
    
    // save the original class name for later restore
    this.classNameOriginal = this.element.className;
    
    // the footer if exist, it may be null if not exist
    this.footer = footer;    
    
    // true if the slide was processed
    this.processed = false;  
    
    // initialize the counter for asynchronous objects on this slides
    // loaded through extensions
    this.async_cntr = {};
    for (var i = 0; i < humla.controler.extensions.list.length; i++)
        this.async_cntr[humla.controler.extensions.list[i].config.id] = 0;
    
	// title of this slide; in section/hgroup
    this.__defineGetter__('title', function() {
	    try {
	        return this.element.getElementsByTagName("hgroup")[0].
	            getElementsByTagName("h1")[0].innerText;
	    } catch(e) { return "n/a"; }
    });

    // adds a new class name to the list of slide's classes
    this.addClass = function(classStr) {
        classStr = humla.utils.str2array(classStr);
	    var cls = " " + this.element.className + " ";
	    for (var i = 0, len = classStr.length, c; i < len; ++i) {
		    c = classStr[i];
		    if (c && cls.indexOf(" " + c + " ") < 0) {
			    cls += c + " ";
		    }
	    }
	    this.element.className = humla.utils.trim(cls);
        
        // we assume that visibility of slide can change so we process the slide here
        this.process();
    };
    
    // removes a class from the list of slide's classes
    this.removeClass = function(classStr) {
	    var cls;
	    if (classStr !== undefined) {
		    classStr = humla.utils.str2array(classStr);
		    cls = " " + this.element.className + " ";
		    for (var i = 0, len = classStr.length; i < len; ++i) {
			    cls = cls.replace(" " + classStr[i] + " ", " ");
		    }
		    cls = humla.utils.trim(cls);
	    } else {
		    cls = "";
	    }
	    if (this.element.className != cls) {
		    this.element.className = cls;
	    }
    };
            
    this.updateFooter = function() {
        if (this.footer)
            this.element.appendChild(this.footer.cloneNode(true));
    };
    
    // reset the slide to its original definition
    this.reset = function() {
        this.element.className = this.classNameOriginal;
        this._yOffset = null;
        this.element.removeAttribute("style");
    };
         
    this.process = function() {
        var obj = this;
        if (!this.processed) {
            humla.controler.callExtensionsInterface("processSlide", this,
             function() { // on success
                    obj.processed = true;
                 },
             function(e) { // on error
                    humla.reportError(obj.formatError(e));
                 });
        }
    };
    
    this.formatError = function(message) {
        return "<a href=\"" + this.url + "\">Slide " + 
            this.number + "</a>: " + message;
    };
    
    this.error = function(message) {
        throw this.formatError(message);
    };
    
    // set footer for this slide
    this.updateFooter();
    
    // get the url of the slide (hash)
    this.__defineGetter__('url', function() {
        return "#" + (humla.server && humla.server.match('[Hh]umla.*') ? "!" : "")  + "/" + (this.element.id ? this.element.id : this.number);
    });    
    
    // returns true if this is an outline slide
    this.isOutline = function() {
    	return this.element.className.indexOf("outline") != -1;
    } 
    
    // get the slide description object
    this.__defineGetter__('description', function() {
        return { title: this.title, "slide-url": humla.baseURI + this.url, outline: this.isOutline() };
    });       
};

/**
 * Section Class
 * @constructor
 */
Section = function(element, parent) {
    // html element of the section
    // check if the element is the section element
    if (element.nodeName.toLowerCase() !== "section" && element.nodeName.toLowerCase() !== "body")
        throw "The element must be a section or body element!";
    this.element = element;
    
    // title of this section; titles in section/header
    try {
        //this.name = humla.utils.xpath('header/@text', this.element).stringValue;
        if (element.nodeName.toLowerCase() == "section")
            this.name = this.element.getElementsByTagName("header")[0].innerText;
        else
            this.name = null;
    } catch(e) { this.name = "n/a"; }
    
    // parent section of this section
    this.parent = parent;
    
    // array of slides that belong to this section
    this.slides = [];
    
    // array of sub-sections that balong to this section
    this.sections = [];
    
    // returns an object representing data about this section, 
    // its slides and its sub-sections
    this.getData = function() {
    	var d = { title : this.name };    	
    	
    	if (this.slides.length > 0) {
    		d.slides = [];
    		for (var i = 0; i < this.slides.length; i++) {
    			d.slides.push(this.slides[i].getData());
    		}
    	}
    	
    	if (this.sections.length > 0) {
    		d.sections = [];
    		for (var i = 0; i < this.sections.length; i++)
    			d.sections.push(this.sections[i].getData());
    	}
    	
    	return d;
    };
    
    // get the section contents object
    this.__defineGetter__('contents', function() {
        var seca = [];
        for (var i = 0; i < this.sections.length; i++)
        	seca.push(this.sections[i].contents);
        
        var secs = this.slides[0];
        if (secs && !secs.isOutline() && humla.slides.indexOf(secs) - 1 >= 0 && 
        	humla.slides[humla.slides.indexOf(secs) - 1].isOutline())
        	secs = humla.slides[humla.slides.indexOf(secs) - 1];
        	
        var cont = { title : parent != null ? this.name : window.document.title, 
        		 "slide-url": humla.baseURI + (this.slides.length > 0 ? secs.url : null), 
        		 sections: seca };
	if (parent === null) {
		cont.lastModified = humla.controler.lastModified;
                cont.slidesCount = humla.slides.length;
        }
	return cont;
    });       
    
};

/**
 * View Class
 * @constructor
 */
var View = function(config, keys, baseDir) {

    // config of this view
    this.config = config;
    
    // keys that can be used in this view
    this.keys = keys;
    
    // base directory of this view to load view scripts
    this.baseDir = baseDir;
    
    // the view controler
    // set external from the controler
    this.controler = null;
    
    this._objref = null;
    // get the current slide of the view
    this.__defineGetter__('objref', function() {
        if (this._objref === null && window[this.config.object]) {
            this._objref = window[this.config.object];
            this._objref.__proto__ = this;
        } 
        return this._objref;
    });

    this.executeViewInterface = function(method, params) {
        if (this.objref && this.objref[method])
                this.objref[method].call(this.objref, params);
                
        // try to execute the same method on extensions
        humla.controler.callExtensionsInterface(method, params, null, null);        
    };
    
    // current slide
    this._currentSlide = null;

    // get the current slide of the view
    this.__defineGetter__('currentSlide', function() {
        if (this._currentSlide === null) {
            var state = this.controler.parseState();
            this._currentSlide = state.slideNum;            
        } 
        return this._currentSlide;
    });

    // set the current slide of the view
    this.__defineSetter__('currentSlide', function(value) {
        this._currentSlide = value;
        this.controler.setState();
    });
    
    this.activateCurrentSlide = function() {
        this.executeViewInterface('enterSlide', humla.slides[this.currentSlide - 1]);
        humla.slides[this.currentSlide - 1].process();
    };

    /* view activation/deactivation */
    
    this.enter = function(slideNo) {
        if (this.controler !== null) {
            humla.reset();
            if (slideNo)
                this.currentSlide = slideNo;
            else
                this.currentSlide = 1;
            humla.utils.activateStyle(this.baseDir + config.style.src, config.style.media);
            this.controler.fullscreen = false;
            this.executeViewInterface('enterView', this);
            this.activateCurrentSlide();        
        } else
            throw "Unexpected Error: controler has not been set on the presentation view!";
    };
    
    this.leave = function() {
        this.executeViewInterface('leaveSlide', humla.slides[this.currentSlide - 1]);    
        humla.utils.deactivateStyle(this.baseDir + config.style.src);
        this.executeViewInterface('leaveView', this);
    };

    /* handling key input */
    
    this.keydown = function(event) {
        // function to check a key is in the array of keys
        var containsKey = function(key, keys) {
            if (keys)
                for (var i = 0; i < keys.length; i++)
                    if (keys[i] == key)
                        return true;
            return false;
        };
        
        // switching view
        for (var i = 0; i < humla.controler.views.length; i++) {
            var m = humla.controler.views[i];
            if (containsKey(event.keyCode, this.keys["view" + m.config.id])) {
                humla.controler.activateView(i);
                return;
            }
        }

        
        // toggle debug information on/off
        if (containsKey(event.keyCode, this.keys.tdebug))
            humla.controler.debugInfo = !humla.controler.debugInfo;

        // press "spare" key - testing purposes
        if (containsKey(event.keyCode, this.keys.spare))
          humla.showMessage(window.status, false, true);

        // toggle error messages on/off
        else if (containsKey(event.keyCode, this.keys.terrs))
            humla.toggleErrors();

        // toggle menu -- testing
        else if (containsKey(event.keyCode, this.keys.tmenu))
            alert("Menu test");

        // navigation within this view
        else if (containsKey(event.keyCode, this.keys.next))
            this.gotoNext();
            
        else if (containsKey(event.keyCode, this.keys.prev))
            this.gotoPrevious();
        
    };
    
    /* navigation */

    this.goto = function(slideNo) {
        if (slideNo - 1 < humla.slides.length && slideNo > 0) {
            this.executeViewInterface('leaveSlide', humla.slides[this.currentSlide - 1]);
            this.currentSlide = slideNo;
            this.activateCurrentSlide();       
        }
    };

    this.gotoNext = function() {
        if (this.currentSlide - 1 < humla.slides.length - 1) {
            this.executeViewInterface('leaveSlide', humla.slides[this.currentSlide - 1]);
            this.currentSlide = this.currentSlide + 1;
            this.activateCurrentSlide();        
        }
    };

    this.gotoPrevious = function() {
        if (this.currentSlide - 1 >= 1) {
            this.executeViewInterface('leaveSlide', humla.slides[this.currentSlide - 1]);
            this.currentSlide = this.currentSlide - 1;
            this.activateCurrentSlide();        
        }
    };

};

/**
 * Extension Class
 * @constructor
 */
var Extension = function(config, baseDir) {
    // constants
    this.LOADING_FINISHED = "Loading finished";
    this.LOADING_INPROGRESS = "Loading";
    this.LOADING_ERROR = "Loading error";    
    
    // configuration of extension
    this.config = config;
    
    // base directory of this extension to load view scripts
    this.baseDir = baseDir;    
    
    this.id = config.id;
    
    this._status = null;
    
    if (config.styles)
        for (var i = 0; i < config.styles.length; i++)
            humla.utils.activateStyle(
		(config.styles[i].src.match("^\s*http.+") ? "" : this.baseDir) + config.styles[i].src, config.styles[i].media); 
    
    this._objref = null;
    // get the reference to this object
    this.__defineGetter__('objref', function() {
        if (this._objref === null && window[this.config.object]) {
            // this will link this extension object with extension object defined in config.object
            // that is, this extension object will become a parent of config.object
            // config.object must exist (must be declared in extension javascript)
            this._objref = window[this.config.object];
            this._objref.__proto__ = this;
        } 
        return this._objref;
    });
    
    this.getParam = function(element, name, defvalue) {
        var v = element.getAttribute(name);
        if (!v)
            v = defvalue;
        element.removeAttribute(name);
        return v;
    };
    
    this.callExtensionInterface = function(method, params) {
        if (this.objref && this.objref[method])
                this.objref[method].call(this.objref, params);
    };
    
    
};

