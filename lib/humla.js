
// if you want to change this you need to adjust values in humla.css
var SLIDE_WIDTH = 800;
var SLIDE_HEIGHT = 600;

// current humla version
var HUMLA_VERSION = "0.3";

/* MAIN HUMLA OBJECT */

var humla = {

    // humla home directory
    home      : "",
    
    // base URI for slides
    baseURI   : window.location.href.replace(/#.*/, ""),    

    // humla server signature (when content served from humla server)
    server    : null,
    
    // humla helper functions 
    utils     : null,
    
    // humla controller
    controler : null,
    
    // root section of all slides
    root      : null,
    
    // message box
    msgbox    : null,
    
    // all slides in the presentation
    slides    : [],
    
    // all errors occured during processing
    errors    : [],

    reset : function() {
        for (var i = 0; i < this.slides.length; i++)
            this.slides[i].reset();
    },
    
    showMessage : function(message, error, update) {
        if (!this.msgbox)
            this.msgbox = new MessageBox();
        this.msgbox.addMessage(message ? message.replace("Uncaught", "") : 
            "Message to display was not set!", error, update);
    },
    
    toggleErrors : function() {
        if (this.msgbox && this.msgbox.div) {
            this.msgbox.dismiss();
            return;
        }
        if (humla.errors.length > 0)
            for (var i = 0; i < humla.errors.length; i++)
                this.showMessage(humla.errors[i], true);
        else
            this.showMessage("So far no errors when processing slides.");        
    },
    
    reportError : function(message) {
        humla.errors.push(message);
        humla.showMessage(message, true);    
    },

    // load slides and initialize humla
    load : function() {
    
        // create utils object
        humla.utils = new Utils(window);
    
        // get the base url of the humla directory
        var scripts = humla.utils.documentHead.getElementsByTagName("script");
        if (scripts !== null)
            for (var x = 0; x < scripts.length; x++) {
                if (scripts[x].src.indexOf("humla.js") != -1) {
                    humla.home = scripts[x].src.substring(0, scripts[x].src.indexOf("humla.js"));
                    break;
                }
            }        
    
        // activate main style sheet and load the main scripts
        //humla.utils.activateStyle(this.home + "core/humla.css", "screen, print");
        var footer = null;   
        
        var loadSlides = function(section) {
            // get all direct descendant elements underneath this section element
            var nodes = section.element.childNodes;        
            
            // collect all subsections and slides of this element
            for (var i = 0; i < nodes.length; i++) {
                var name = nodes[i].nodeName.toLowerCase();
                
                // check if this is the footer element
                if (name == 'footer')
                    footer = nodes[i];
                else 
                
                // process the section element
                if (name == 'section') {
                    var s = new Section(nodes[i], section);
                    section.sections.push(s);
                    loadSlides(s);
                } else
                
                // process the slide element
                if (name == 'div' && nodes[i].className.indexOf('slide') != -1) {
                    var slide = new Slide(nodes[i], footer, section, humla.slides.length + 1); 
                    section.slides.push(slide);
                    humla.slides.push(slide);
                } // else TODO: add warning in case the element is not text element      
            }        
        };
        
        // function to read main and suplementary configuration
        var readConfig = function(dataReady) {
            var mainConfig = {}, suplConfig = {}, callbackcalled = false;

            humla.utils.readJSONData(humla.home + "config.json", 
                function(data, status, msg, xhr) {
                    if (msg)
                        humla.reportError(msg);
        	    
                    if (xhr.getResponseHeader('server'))
			humla.server = xhr.getResponseHeader('server');                

                    mainConfig.data = data;
                    mainConfig.status = status;
                    mainConfig.baseDir = humla.home;
                    
                    if (suplConfig.status && !callbackcalled) {
                        callbackcalled = true;
                        dataReady(mainConfig, suplConfig);
                    }
                }
            );

            // calculate a path for this slides home
            var path = window.location + "";
            if (path.indexOf("#") != -1)
                path = path.substring(0, path.indexOf("#"));
            if (path.lastIndexOf("/") != -1)
                path = path.substring(0, path.lastIndexOf("/") + 1);
            else
                path = "/";
                
            humla.utils.readJSONData(path + "humla-config.json", 
                function(data, status, msg) {
                    if (msg)
                        humla.reportError(msg);
                    
                    suplConfig.data = data;
                    suplConfig.status = status;
                    suplConfig.baseDir = path;
                    
                    if (mainConfig.status && !callbackcalled) {
                        callbackcalled = true;
                        dataReady(mainConfig, suplConfig);
                    }
                }
            );    
        };        
    
        this.utils.loadScripts(function() {
            humla.utils.documentBody.style.visibility = "visible";

            // create the controler
            humla.controler = new Controler(window);
            
            // create the root section and load the slides
            humla.root = new Section(humla.utils.documentBody, null);
            loadSlides(humla.root);
                        
            // redirect alert to humla messages
            window.alert = function(msg) {
                humla.showMessage("alert: " + msg, false, true);
            };

            // register listener to handle errors 
            window.addEventListener("error", function(event) {
                    humla.reportError(event.message);
                }, false);

            // register keydown listener
            window.addEventListener("keydown", function(event) {
                humla.controler.keydown(event);
                }, false);

            // register keyup listener
            window.addEventListener("keyup", function(event) {
                humla.controler.keyup(event);
                }, false);

            // register listener to handle fullscreen 
            window.addEventListener("resize", function(event) {
                    humla.controler.updateFullscreenWindow(event);
                    if (humla.utils.msgbox)
                        humla.msgbox.updatePosition();
                }, false);
                
            // on changing hash to update the date 
            window.addEventListener("hashchange", function(event) {
                    humla.controler.updateControlerState();
                }, false);                                
                
            // read configuration and initialize the controler
            readConfig(
                function(mainConfig, suplConfig) {
                    humla.controler.keys = suplConfig.data && suplConfig.data.key ? 
                        suplConfig.data.keys : mainConfig.data.keys;
                    
                    if (suplConfig.data !== null) {
                        // delete all views from main config that are in supl config
                        if (mainConfig.data.views && suplConfig.data.views)
                            for (var x1 = 0; x1 < mainConfig.data.views.length; x1++) {
                                for (var y1 = 0; y1 < suplConfig.data.views.length; y1++) {
                                    if (mainConfig.data.views[x1] && mainConfig.data.views[x1].id == suplConfig.data.views[y1].id)
                                        mainConfig.data.views[x1] = null;
                                }
                            }
                        
                        // delete all extensions from main config that are in supl config
                        if (mainConfig.data.extensions && suplConfig.data.extensions)                        
                            for (var x2 = 0; x2 < mainConfig.data.extensions.length; x2++) {
                                for (var y2 = 0; y2 < suplConfig.data.extensions.length; y2++) {
                                    if (mainConfig.data.extensions[x2] && mainConfig.data.extensions[x2].id == 
                                    	suplConfig.data.extensions[y2].id)
                                        mainConfig.data.extensions[x2] = null;
                                }
                            }
                    }
                    
                    // create and register presentation views
                    var registerViews = function(data, baseDir) {
                        if (data && data.views) {
                            for (var i = 0; i < data.views.length; i++) {
                                if (data.views[i]) {
                                    var keys = JSON.parse(JSON.stringify(humla.controler.keys));
                                    if (data.views[i].keys_disabled)
                                        for (var j = 0; j < data.views[i].keys_disabled.length; j++) 
                                            keys[data.views[i].keys_disabled[j]] = null;
                                    
                                    humla.controler.registerView(
                                        new View(data.views[i], keys, baseDir));
                                }
                            } 
                        }
                    };
                    
                    // register extensions                    
                    var registerExtensions = function(data, baseDir) {
                        if (data && data.extensions) {
                            for (var j = 0; j < data.extensions.length; j++) 
                                if (data.extensions[j] && data.extensions[j].enabled) {
                                    humla.controler.addExtension(
                                        new Extension(data.extensions[j], baseDir));
                                }
                        }
                    };
                    
                    // register views and extensions from the main and supplementary configuration
                    registerViews(mainConfig.data, mainConfig.baseDir);
                    registerViews(suplConfig.data, suplConfig.baseDir);
                    registerExtensions(mainConfig.data, mainConfig.baseDir);
                    registerExtensions(suplConfig.data, suplConfig.baseDir);
                    
                    // load all the scripts and run the controller
                    humla.controler.run();
                });
            
        }, [{ src : humla.home + "core/humla-core.js" }, { src : humla.home + "core/humla-controler.js" }]);    
    },
    
    // description object
    description : function() {
    	var sld = [];
    	for (var i = 0; i < this.slides.length; i++)
    		sld.push(this.slides[i].description);
    	
    	return { title: window.document.title, slides : sld};
    },     
    
    // get all slides description object
   	allslides: function() {
    	var alls = [];
    	for (var i  = 0; i < this.slides.length; i++) {
    		alls.push(this.slides[i].description);
    	}
        return { title : window.document.title, slides: alls };
    }       
     
};

/* HUMLA UTILITIES */

var Utils = function(window) {
    this.window = window;
    this.document = window.document;
    this.browser = browser.browser;
    this.browser_version = browser.version;
    
    this.documentHead = this.document.getElementsByTagName("head")[0];
    this.documentBody = this.document.getElementsByTagName("body")[0];

    this.firstUserStyle = null;
    
    this.msgbox = null;

    this.trim = function(str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };

    this.str2array = function(s) {
        var spaces = /\s+/, a1 = [""];
    
        if (typeof s == "string" || s instanceof String) {
            if (s.indexOf(" ") < 0) {
                a1[0] = s;
                return a1;
            } else {
                return s.split(spaces);
            }
        }
        return s;
    };
    
    this.createScriptElement = function(src) {
        var script = this.document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        script.loaded = false;
        return script;
    };

    this.createStyleElement = function(src, media) {
        var style = this.document.createElement('link');
        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.href = src;
        style.media = media !== null ? media : 'screen';
        style.disabled = false;
        return style;
    };

    // activate the style on the document
    this.activateStyle = function(style, media) {
        if (!style)
            return;
        
        // try to find the style among document's styles         
        for (var i = 0; i < this.document.styleSheets.length; i++) {
            var css = this.document.styleSheets[i];
            
            // only look for user style in the first run
            if (css.href && this.firstUserStyle === null)
                this.firstUserStyle = css;
            
            if (css.href && css.href.indexOf(style) != -1 && css.disabled) {
                css.disabled = false;
                return;
            }
        }
        
        // if not found in the first run, there is no user style
        if (!this.firstUserStyle)
            this.firstUserStyle = "";
        
        // style has not been found - add it
        if (true || this.firstUserStyle == "")
            this.documentHead.appendChild(this.createStyleElement(style, media));
        else {
            this.documentHead.insertBefore(this.createStyleElement(style, media), this.firstUserStyle);  
	}          
    };

    // deactivate the style on the document
    this.deactivateStyle = function(style) {
        if (!style)
            return;
            
        // try to find the style among document's styles         
        for (var i = 0; i < this.document.styleSheets.length; i++) {
            var css = this.document.styleSheets[i];
            if (css.href !== null && css.href.indexOf(style) != -1 && !css.disabled) {
                css.disabled = true;
                return;
            }
        }
    };
    
    /**
     * Loads scripts in groups and fires onload callback when complete
     * @param onload callback when loading is finished
     * @param scripts array of objects { src : url, g : group }, where 
     *        url is a javasciript url and group is a group number between 0-9. 
     *        scripts that belong to the same group will be loaded cuncurrently. 
     */
    this.loadScripts = function(onload, scripts) {
        var groups = {};
        var rgid = new RegExp("^[0-9]$");        
        
        // create the groups object, organize scripts into groups, default group is 0
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].g)
                if (!rgid.test(scripts[i].g))
                    throw "Error in configuration, script's group ID must be a number between 0-9! Script: " + scripts[i].src;
            
            var gid = "g" + (scripts[i].g ? scripts[i].g : "0");
            if (!groups[gid])
                groups[gid] = [];
            var script = this.createScriptElement(scripts[i].src);
            groups[gid].push(script);
        }
        
        // function to load all scripts that belong into group g
        var loadGroup = function(g) {
            // call callback when we reach level 5 but continue loading scripts 
            // scripts in group 5 and above will not block loading the whole presentation
            // --> they are not required for starting the presentation
            // TODO: number 5 can be perhaps set as a configuration parameter
            if (g == 5 && onload)
                onload();
            
            if (g > 9)
                return;
            
            var gid = "g" + g;
            var onscriptloaded = function(event) {
                for (var x = 0; x < groups[gid].length; x++) 
                    if (event.target == groups[gid][x]) {
                        groups[gid][x].loaded = true;
                        break;
                    }
                
                for (var y = 0; y < groups[gid].length; y++) 
                    if (!groups[gid][y].loaded) 
                        return;
                
                loadGroup(g + 1);
            };
            
            if (groups[gid] && groups[gid].length > 0) {
                for (var i = 0; i < groups[gid].length; i++) {
                    groups[gid][i].addEventListener("load", onscriptloaded, false);
                    humla.utils.documentHead.appendChild(groups[gid][i]);
                }
            } else
                loadGroup(g + 1);
        };
        
        loadGroup(0);        
    };
    
    this.readJSONData = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = null;
                    try {
                        data = JSON.parse(xhr.responseText);
                    } catch (e) {
                        callback(null, xhr.status, 
                            "Error when parsing JSON data. " + e, xhr);
                    }
                    callback(data, xhr.status, null, xhr);
                } else 
                    callback(null, xhr.status, null, xhr);
            }
        };
        xhr.send();
    };            
};

/* MESSAGE BOX */

var MessageBox = function(message) {
    this.div = null;
    this.timer = null;
    this.disabled = false;
    
    this.disable = function() {
	this.disabled = true;
	this.dismiss();
    }

    this.enable = function() {
    	this.disabled = false;
    }
        
    this.addMessage = function(message, error, update) {
	if (!this.disabled) {
	        if (this.div && update) {
	            humla.utils.documentBody.removeChild(this.div);
        	    this.div = null;
	        }
        
	        if (!this.div) {
        	    this.div = humla.utils.document.createElement("div");
	            this.div.id = "msgbox";
        	    this.div.className = "msgbox";
	            this.div.addEventListener("mouseover", function() {humla.msgbox.updateTimer(true);}, false);
        	    this.div.addEventListener("mouseout", function() {humla.msgbox.updateTimer();}, false);
	            this.div.innerHTML = "<span class='close' onclick='humla.msgbox.dismiss();'></span>";
	        }
        
	        this.div.innerHTML = "<p" + (error ? " class=\"error\">" : ">") + message + "</p>" + this.div.innerHTML;
        	humla.utils.documentBody.insertBefore(this.div, humla.utils.documentBody.childNodes[0]);
	        this.updatePosition();
        	this.updateTimer();
	}
    };
    
    this.updatePosition = function() {
        if (this.div)
            this.div.style.left = ((humla.utils.window.innerWidth - 650) / 2) + "px";
    };
    
    this.dismiss = function(msgbox) {
        if (!msgbox) msgbox = this;
        if (msgbox.div)
            humla.utils.documentBody.removeChild(msgbox.div);
        msgbox.div = null;  
        msgbox.updateTimer(true);
    };
    
    this.updateTimer = function(clear) {
        if (this.timer) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
        if (!clear)
            this.timer = window.setTimeout(this.dismiss, 3500, this);    
    };
    
    if (message)
        this.addMessage(message);
};

/* LOAD HUMLA */

document.addEventListener("DOMContentLoaded", function() {
    // check the browser version
    if (true || navigator.userAgent == "no-ga-tv" ||
        (browser.browser == "Chrome" && browser.version >= 13) ||
        (browser.browser == "Safari" && browser.version >= 5.1) || 
         browser.browser == "wkhtmltopdf") {
        document.getElementsByTagName("body")[0].style.visibility = "hidden";
        
        humla.load();
    } else {
        document.getElementsByTagName("body")[0].innerHTML = 
        "<p style=\"margin-left: auto; margin-right: auto; width: 700px; font-size: 24px; text-align: center; color: #666\">" + 
        "We are sorry but Humla currently only works on the versions of Chrome 13 and Safari 5.1 or higher. " + 
        "<a href=\"https://github.com/tomvit/humla\">Fork it on github</a> and improve it!</p>";
    }    
}, false);

/* BROWSER DETECT */

var browser = {
    
    init: function () {
    	this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| 0;
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
    
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
    
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
    
	dataBrowser: [
    	{
			string: navigator.userAgent,
			subString: "Qt",
			identity: "wkhtmltopdf",
            versionSearch: "Qt/"
		},
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
    
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};

browser.init();

