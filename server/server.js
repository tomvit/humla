
var http = require('http'),
    path = require('path'),
    exec = require('child_process').exec,
    paperboy = require('paperboy'),
    url = require('url'),
    fs = require('fs');
    
var SERVER_VERSION = "0.1";
    
var config = JSON.parse(fs.readFileSync(path.join(path.dirname(__filename), "config.json")));
config.PUBLIC_HTML = path.join(path.dirname(__filename), config.PUBLIC_HTML);

var emodule = require('./extensions.js');
var extensions = new emodule.Extensions(config);    

var PJS_SLIDEHTML = path.join(path.dirname(__filename), 'pjs_slidehtml.js ');

http.createServer(
	function (req, res) {
		// parse the request URL
		var urlp = url.parse(req.url, true);
	
	    // ajax crawling of a single humla slide
	    if (urlp.query && urlp.query["_escaped_fragment_"]) {
	 		hurl = "http://" + config.HOSTNAME + "/" + urlp.pathname + "#" + urlp.query["_escaped_fragment_"];
			config.execute_pjs(PJS_SLIDEHTML, hurl, 
				function(data) {
					res.writeHead(200);
					res.end(stdout);
				},
				function(error) {
					console.log(error);
					res.writeHead(500);
					res.end();
				}
			);
			return;	
		}
		
		// http caching, check if the content changed
		var etag = extensions.getResource_etag(urlp); 
		if (etag && req.headers['if-none-match']) {
			if (etag.etag == req.headers['if-none-match'].replace(/"/gi, "")) {
				var headers = {};
				if (etag) {
					headers['Cache-Control'] = 'public max-age=3600';
					headers['ETag'] = '"' + etag.etag + '"';
				}
				headers['Access-Control-Allow-Origin'] = '*';
				res.writeHead(304, headers); // Not Modified
				res.end();
				return;
			}
		}
		
		// retrieve API resource content
		extensions.getResource(urlp, 
			function(data, error) {
				if (error) {
					console.log(error);
					res.writeHead(500);
					res.end();
					return;
				}
				
				var headers = {};
				headers['Content-Type']  = 'application/json';
				if (etag) {
					headers['Cache-Control'] = 'public max-age=3600';
					headers['ETag'] = '"' + etag.etag + '"';
				}
				headers['Access-Control-Allow-Origin'] = '*';
			
				res.writeHead(200, headers);
				if (data)
					res.end(JSON.stringify(data));
				else
					res.end();
				return;
			}
		);
			
		// deliver slides if not an API request
	    if (!urlp.pathname.match("^/api.*"))
	    	paperboy.deliver(config.PUBLIC_HTML, req, res)
	        	.addHeader('Cache-Control', "public, max-age=3600")
				.addHeader("Server", "Humla-Server v" + SERVER_VERSION + "; ajax-crawling=true")
	           	.otherwise(function(err) {
	            	res.writeHead(404);
	            	res.end();
	        	});
	        	
	}
).listen(config.SERVER_PORT, config.SERVER_IP);