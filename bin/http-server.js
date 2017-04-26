/* Simple http server to serve Humla content 
   Originally based on a code from
   http://adrianmejia.com/blog/2016/08/24/Building-a-Node-js-static-file-server-files-over-HTTP-using-ES6/
*/
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = require('child_process').exec;

const port = process.argv[2] || 9000;
const mode = process.argv[3] || "";


getLastModified = function(pathname, onready, onerror) {
  var cmd = "git log -1 --format=\"%ad\" --date=rfc -- " + pathname;
  exec(cmd, 
	function (error, stdout, stderr) {
        	if (!error) {
			var d = new Date(Date.parse(stdout));
                	onready(d);
                } else
                	if (onerror)
                        	onerror("Error executing '" + cmd + "'. The error was " + error)
        });
}

http.createServer(function (req, res) {
  if (mode !== "--quiet")
  	console.log(`${req.method} ${req.url}`);

  // parse URL
  const parsedUrl = url.parse(req.url);
  // extract URL path
  let pathname = `.${parsedUrl.pathname}`;
  if (pathname === "./") pathname = "index.html";

  // based on the URL path, extract the file extention. e.g. .js, .doc, ...
  const ext = path.parse(pathname).ext;

  // maps file extention to MIME typere
  const map = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword'
  };

  fs.exists(pathname, function (exist) {
    if(!exist) {
      // if the file is not found, return 404
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }

    // if is a directory search for index file matching the extention
    if (fs.statSync(pathname).isDirectory()) pathname += '/index' + ext;

    // read file from file system
    fs.readFile(pathname, function(err, data){
      if(err){
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', map[ext] || 'text/plain' );
	
	getLastModified(pathname, 
		function(lastModified) {
			res.setHeader('Last-Modified', lastModified.toUTCString());
			res.end(data);
		},
		function() {
			if (mode != "--quiet")
				console.log("Cannot retrieve last modified from git log for " + pathname + ", using fs created time.");
			var stats = fs.statSync(pathname);
        		var mtime = new Date(util.inspect(stats.ctime));
        		res.setHeader('Last-Modified', mtime.toUTCString())
			res.end(data);			
		}
	);	
      }
    });
  });


}).listen(parseInt(port));

if (mode !== "--quiet")
	console.log(`Server listening on port ${port}`);
