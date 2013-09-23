/**
* Humla Server v0.1
* Humla server provides server side functionality for Humla HTML5 presentations
* such as AJAX crawling and a specialized functionality via Humla API. 
*
* Tomas Vitvar, tomas@vitvar.com
**/

// import libraries
var http = require('http'),
    path = require('path'),
    exec = require('child_process').exec,
    paperboy = require('paperboy'),
    url = require('url'),
    fs = require('fs');
            
// main configuration file from config.json
var config = JSON.parse(fs.readFileSync(path.join(path.dirname(__filename), "config.json")));
config.PUBLIC_HTML = path.join(path.dirname(__filename), config.PUBLIC_HTML);

// global constants    
config.SERVER_VERSION = "0.1";

// check the presence of phantomjs, AJAX crawling and some APIs can only be allowed if phantomjs is present    
if (!fs.statSync(config.PHANTOMJS)) {
	console.log(
		util.format("Cannot find phantomjs (%s), axaj crawling and some APIs will be disabled!", config.PHANTONJS));
	config.PHANTOMJS_EXISTS = false;
} else
	config.PHANTOMJS_EXISTS = true;  

// load extension modules as defined in config.json
var emodule = require('./extensions.js');
var extensions = new emodule.Extensions(config);    

// phatnom.js script to retrieve AJAX content from Humla slides
var PJS_SLIDEHTML = path.join(path.dirname(__filename), 'pjs_slidehtml.js ');
var PJS_PRINTPDF = path.join(path.dirname(__filename), 'pjs_printpdf.js ');

// creates and runs the server
http.createServer(
	function (req, res) {
             // parse the request URL
	     var urlp = url.parse(req.url, true);
	
	    // ajax crawling of a single humla slide
	    if (urlp.query && urlp.query["_escaped_fragment_"]) {
	    	// URL to request AJAX content based from AXAJ crawling request
	 		hurl = "http://" + config.HOSTNAME + "/" + urlp.pathname + "#" + urlp.query["_escaped_fragment_"];
			config.execute_pjs(PJS_SLIDEHTML, [ hurl ], 
				function(data) {
					res.writeHead(200);
					res.end(data);
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
			function(data, error, format) {
				if (error) {
					console.log(error);
					res.writeHead(500);
					res.end();
					return;
				}
				
				if (!format)
					format = 'application/json';
									
				var headers = {};
				headers['Content-Type']  = format;
				if (etag) {
					headers['Cache-Control'] = 'public max-age=3600';
					headers['ETag'] = '"' + etag.etag + '"';
				}
				headers['Access-Control-Allow-Origin'] = '*';
			
				res.writeHead(200, headers);
				if (data)
					if (format == 'application/json')
						res.end((typeof data=="object") ? JSON.stringify(data) : data);
					else
						res.end(data);
				else
					res.end();
				return;
			}
		);

		// create pdf 
		if (urlp.pathname.match("^.*/lecture[0-9]{1,2}\.pdf$")) {
			// check if pdf exists and if the date matches the html date
			fpdf = config.PUBLIC_HTML + "" + urlp.pathname;
			fhtm = config.PUBLIC_HTML + "" + urlp.pathname.replace(".pdf", ".html");
			if (path.existsSync(fhtm)) {
				var genpdf = !path.existsSync(fpdf) || urlp.query.hasOwnProperty('rel');

				if (!genpdf && path.existsSync(fpdf) && path.existsSync(fhtm) ) {
					opdf = fs.statSync(fpdf);
					ohtm = fs.statSync(fhtm);
					mp = JSON.stringify(opdf.mtime);
					mh = JSON.stringify(ohtm.mtime);
					genpdf = (mp != mh);
				}
				
				if (genpdf) {
					hurl = "http://" + config.HOSTNAME + "/" + urlp.pathname.replace(".pdf", ".html") + "#/1/v4";
                        		config.execute_pjs(PJS_PRINTPDF, [ hurl, fpdf ],
                                		function(data) {
							// set the modification date of pdf file to be the same as the html file
							exec("touch -m -d \"$(stat " + fhtm + " | grep 'Modify: ' | sed s/Modify:.//)\" " + fpdf,
								function(error, stdout, stderr) { if (error) console.log(stderr); } );

							// return the pdf when ready
							paperboy.deliver(config.PUBLIC_HTML, req, res).
								otherwise(function(err) {
                        						res.writeHead(404);
                        						res.end();
                        					});
						},
                                		function(error) {
							// log error
                                        		console.log(error);
                                        		res.writeHead(500);
                                        		res.end();
                                		}
                        		);
					return;	
				}
			}	
		}
			
		// deliver slides if not an API request
	    if (!urlp.pathname.match("^/api.*"))
	    	paperboy.deliver(config.PUBLIC_HTML, req, res)
	        	.addHeader('Cache-Control', "public, max-age=3600")
				.addHeader("Server", "Humla-Server v" + config.SERVER_VERSION + "; ajax-crawling=" + config.PHANTOMJS_EXISTS)
	           	.otherwise(function(err) {
	            	res.writeHead(404);
	            	res.end();
	        	});
	        	
	}
).listen(config.SERVER_PORT, config.SERVER_IP);
