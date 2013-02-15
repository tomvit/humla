
var https = require('https');

var Drawing = function(config) {

	this.config = config;
	
	this.getTitle = function(drawingId, ondataready) {
		// request config to retrieve the drawing title
		var options = {
    			host: 'docs.google.com',
    			port: 443,
    			path: '/drawings/export/svg?id=' + drawingId,
    			method: 'HEAD'
			}
			;
	
		// send the request and process the response	
		var dreq = https.request(options, 
			function(dres) {
    			if (dres.statusCode === 200) {
    				if (dres.headers['content-disposition']) {
    					var title = dres.headers['content-disposition'].match("^.*filename\\*=UTF-8''(.+)\.svg.*$");
    					if (!title) title = "n/a"; else title = decodeURIComponent(title[1]);
    					ondataready({ id: drawingId, title: title }, null);
    				}
    			} else 
    				ondataready(null, "Error while retrieving a drawing title, id=" + drawingId + " status code=" + dres.statusCode);
    		}
    	);
    	
    	dreq.end();
	}
	
	this.getTitle_etag = function(drawingId) {
		return null;
	}
	
}

exports.create = function(config) {
	return new Drawing(config);
}

