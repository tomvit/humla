/*
    humla - HTML5 slides and presentation environment
    Tomas Vitvar, tomas@vitvar.com
    
    humla classes and functions for controlling the slideshow
*/

/* Controler is the main class that controls the presentation and interaction
   with extensions */

Controler = function(window) {
    // HTML window
    this.window = window;
    
    // controler state; changed to 'complete' when controler is running
    this.readyState = null;
    
    // keys to control the slides;
    this.keys = null;
    
    // fullscreen 
    this._fullscreen = false;
        
    // HTML document
    this.document = window.document;
    
    // last modification date of the document
    this.lastModified = "n/a";
    if (this.document.lastModified) {
        var lmd = new Date(Date.parse(document.lastModified) - new Date().getTimezoneOffset()*60*1000);
        var fmt = function(v) { return (v+"").length == 1 ? "0" + v : v; };        
        this.lastModified = lmd.toDateString() + ", " + fmt(lmd.getHours()) + 
            ":" + fmt(lmd.getMinutes()) + ":" + fmt(lmd.getSeconds());
    }
    
    // currently pressed key
    this.keydownevent = null;

    // list of views
    this.views = [];
    
    // enabled extensions
    this.extensions = { index : {}, list : [] };
    
    // currently selected presentation view
    this.currentView = null;

    // register new view
    this.registerView = function(view) {
        view.controler = this;
        this.views.push(view);
    };
    
    // find the presentation view based on its name in javascript file name,
    this.getViewByName = function(name) {
        for (var i = 0; i < this.views.length; i++)
            if (this.views[i].config.script.src.indexOf(name) != -1)
                return this.views[i];
        return null;
    };
    
    // activate the view of index inx
    this.activateView = function(inx, state) {
        if (inx < 0 || inx >= this.views.length)
            throw "Unexpected Error: Index out of bounds!";
        
        if (!state)
            state = this.parseState();
        
        if (this.currentView !== null)
            this.currentView.leave();
        this.currentView = this.views[inx];
        this.currentView.enter(state.slideNum);
        this.setState();
    };
    
    /* adds new extension */
    this.addExtension = function(extension) {
        this.extensions.index[extension.id] = extension;
        this.extensions.list.push(extension);
    };
    
    /* returns extension based on its id */
    this.getExtensionById = function(id) {
        return this.extensions.index[id];
    };
    
    /* calls a method of all extensions if exist */
    this.callExtensionsInterface = function(method, params, onSuccess, onError) {
        try {
            for (var i = 0; i < this.extensions.list.length; i++)
                this.extensions.list[i].callExtensionInterface(method, params);
            if (onSuccess)
                onSuccess();
        } catch (e) {
            if (onError)
                onError(e);
        }    
    };
    
    // the main method to load the views' scripts and run the controler
    this.run = function() {
        // assembles the list of all scripts to be loaded
        // both view and extensions
        var scripts = [];
        for (var y = 0; y < this.extensions.list.length; y++) {
            if (this.extensions.list[y].config.scripts)
                for (var z = 0; z < this.extensions.list[y].config.scripts.length; z++) {
                    var _src = (this.extensions.list[y].config.scripts[z].src.indexOf("http") !== 0  ? 
                        this.extensions.list[y].baseDir : "") + this.extensions.list[y].config.scripts[z].src;
                    scripts.push({ src : _src,
                        g : this.extensions.list[y].config.scripts[z].g });
                }
        }
        for (var x = 0; x < this.views.length; x++)
            scripts.push({ src : this.views[x].baseDir + this.views[x].config.script.src,
                g : this.views[x].config.script.g });
        
        // loads the scripts and update the state of the controler once 
        // all finished loading
        var ctrl = this;
        humla.utils.loadScripts(function() { ctrl.updateControlerState(); ctrl.readyState = 'complete'; }, scripts);       
    };

    // update window to fit the slide to the fullscreen if enabled
    this.updateFullscreenWindow = function(event) {
        if (this._fullscreen) {
            var newZoom = 1;
            if (this.window.innerHeight < this.window.innerWidth)
                newZoom = this.window.innerHeight / SLIDE_HEIGHT;
            else
                newZoom = this.window.innerWidth / SLIDE_WIDTH;
            for (var i = 0; i < humla.slides.length; i++)
                humla.slides[i].element.style.zoom = newZoom;        
        }
	};
    
    // set the fullscreen on/off
    this.__defineSetter__('fullscreen', function(value) {
        if (this._fullsceen != value) {
            this._fullscreen = value;
            if (!this._fullscreen)
                for (var i = 0; i < humla.slides.length; i++)
                    humla.slides[i].element.removeAttribute("style");
            else
                this.updateFullscreenWindow();
        }
    });

    // get the value of the fullscreen
    this.__defineGetter__('fullscreen', function() {
        return this._fullscreen;
    });
    
    // sets the state of the controler - updates the window location hash 
    this.setState = function() {
        if (this.currentView !== null) {
            var cm = this.currentView;
            this.window.location.hash = humla.slides[cm.currentSlide - 1].url + 
                "/v" + cm.config.id;
        }
    };
    
    // updates the state of the controler according to the current state
    // from the location hash and activates the view if state changed
    this.updateControlerState = function() { 
        var state = this.parseState();
        if (!this.currentView || this.currentView.config.id != state.view || 
            this.currentView._currentSlide != state.slideNum) { 
            var inx = 0;
            for (var i = 0; i < this.views.length; i++)
                if (this.views[i].config.id == state.view) {
                    inx = i;
                    break;
                }
            this.activateView(inx, state);                    
        }
    };
    
    // parses the state and returns it as a state object
    this.parseState = function(state_str) {
        var state = (state_str ? state_str : this.window.location.hash);
        var r = { view : this.currentView ? this.currentView.config.id : 1, slideNum :  1 };
        var rexp = new RegExp("^#!?/?([0-9A-Za-z_\-]+)(/v([0-9A-Za-z]{1,2}))?/?$");
        if (rexp.test(state)) {
            if (RegExp.$3)
                r.view = RegExp.$3;

            if (RegExp.$1==="__prev") {
                r.slideNum = this.currentView.currentSlide - 1;
            } else     
                r.slideNum = parseInt(RegExp.$1);

            if (isNaN(r.slideNum)) {
                r.slideNum = 1;
                for (var i = 0; i < humla.slides.length; i++)
                    if (humla.slides[i].element.getAttribute("id") == RegExp.$1) {
                        r.slideNum = humla.slides[i].number;
                        break;
                    }
            }
        }
        return r;        
    };
    
    this.goto = function(slideNo) {
        this.currentView.goto(parseInt(slideNo));
    };
    
    this.keydown = function(event) {
        this.keydownevent = event;
        this.currentView.keydown(event);
    };

    this.keyup = function(event) {
        this.keydownevent = null;
    };
    
    // debug information - toggle on and off
    this._debugInfo = false;

    this.__defineGetter__('debugInfo', function() {
        return this._debugInfo;
    });

    this.__defineSetter__('debugInfo', function(value) {
        if (this._debugInfo != value) {
            if (value)
                for (var i = 0; i < humla.slides.length; i++)
                    humla.slides[i].addClass("debug");
            else
                for (var j = 0; j < humla.slides.length; j++)
                    humla.slides[j].removeClass("debug");
            this._debugInfo = value;    
        }
    });
            
};




