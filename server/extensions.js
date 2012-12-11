/**
* Extensions.js defines a class that allows to load definitions of extensions from config.json
* load an extension handler for each extension and find methods to perform particular API requests.
*/

var exec = require('child_process').exec;

// Extension class
var Extensions = function(config) {

	// remember the configuration
	this.config = config;
	
	// function to execute external phantom js commands to retrieve AJAX content
	this.config.execute_pjs = function(pjs_script, url, onready, onerror) {
		var cmd = this.PHANTOMJS + " " + pjs_script + url; 	
		exec(cmd, 
			function (error, stdout, stderr) {
				if (!error) {
					onready(stdout);
				} else
					if (onerror) 
						onerror("Error executing '" + cmd + "'. The error was " + error)
			}
		);	
	}
	
	// function to retrieve handler based on id
	this.config.searchHandler = function(id) {
		for (var i = 0; i < this.extensions.length; i++) {
			if (this.extensions[i].id === "lectures") 
				return this.extensions[i].handler;
		}
		return null;
	}

	// constructs a pattern for a path based on a service definition 
	var createPathPattern = function(service) {
		var path = service.path;			
		for (prm_name in service.params) 
			path = path.replace("{" + prm_name + "}", "(" + service.params[prm_name] + ")");
		return path;
	}
	
	// read extensions from config
	// this will load handler from the extension library and creates patterns
	// that are later used to resolve url paths
	for (var i = 0; i < this.config.extensions.length; i++) {
		try {
			if (this.config.extensions[i].enabled) {
				// load extension handler
				this.config.extensions[i].handler = require('./api/' + 
					this.config.extensions[i].id + '.js').create(this.config);
					
				// create pattern for each extension service
				for (var j = 0; j < this.config.extensions[i].services.length; j++)
					this.config.extensions[i].services[j].pattern = 
						createPathPattern(this.config.extensions[i].services[j]);
			}
		} catch (e) {
			console.log('Error reading extension ' + this.config.extensions[i].id + ': ' + e);
		}
	}
	
	// retrieves a definition of a method that can be used to handle the request descirbed by url
	this.getMethod = function(url, etag) {
	
		for (var i = 0; i < this.config.extensions.length; i++) {
			
			if (this.config.extensions[i].enabled && this.config.extensions[i].services)
				for (var j = 0; j < this.config.extensions[i].services.length; j++) {
					var re = new RegExp(this.config.extensions[i].services[j].pattern);
					var m = re.exec(url.pathname);
					if (m) {
						var params = [];
						if (m.length > 0) {
							for (var k = 1; k < m.length; k++) 
								params.push(m[k]);
						}
						
						var method_name = this.config.extensions[i].services[j].name;
						if (etag)
							method_name = method_name + "_etag";
							
						if (this.config.extensions[i].handler[method_name])
							return { 
								handler	: this.config.extensions[i].handler, 
								method	: this.config.extensions[i].handler[method_name], 
								params	: params };
						else
							throw "Method " + method_name + " was not found in handler " + this.config.extensions[i].id;
					}
				}
		}
		
		return null;
	}
	
	// retrieves the resources representation that corresponds to the url
	this.getResource = function(url, ondataready) {
		var m = this.getMethod(url, false);
		if (m) {
			if (ondataready)
				m.params.push(ondataready);
			return m.method.apply(m.handler, Array.prototype.slice.call(m.params, 0));
		} else
			return null;
	}

	// retrieves etag for the resource representation that corresponds to the url
	this.getResource_etag = function(url) {
		var m = this.getMethod(url, true);
		if (m)
			return m.method.apply(m.handler, Array.prototype.slice.call(m.params, 0));
		else
			return null;
	}

}

exports.Extensions = Extensions;

