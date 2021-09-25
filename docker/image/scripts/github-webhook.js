// github-webhook service 
// @author: Tomas Vitvar, tomas@vitvar.com

const express = require('express')
const bodyParser = require('body-parser')
const child_process = require('child_process');

const app = express()
const port = 8080

var jsonParser = bodyParser.json()

function run_script_stream(req, res, stream_response) {
    console.log("Starting process webhook /opt/humla/scripts/publish-gh-pages.sh");
    var child = child_process.spawn("/opt/humla/scripts/publish-gh-pages.sh");

    var scriptOutput = "";

    if (stream_response) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
    }

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
        process.stdout.write(data);
	if (stream_response)
	  res.write(data);    
        data=data.toString();
        scriptOutput+=data;
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        process.stdout.write(data);
	if (stream_response)
	  res.write(data);
        data=data.toString();
        scriptOutput+=data;
    });

    child.on('close', function(code) {
	console.log("The script finished, the exit code="+code)
	if (stream_response)
	  res.end()    
	else 
	  res.send(scriptOutput)
    });
}

let reqLogger = (req, res, next) => {
  let dt = new Date();
  let fdt = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();	 
  console.log(`*** [${fdt}]: ${req.method} ${req.url}`);
  next();
};

app.use(reqLogger);

app.post('/humla/', jsonParser, (req, res) => {
  console.log("Received WebHook request for " + req.body.ref)
  branchName = req.body.ref.split('/').slice(-1)[0]	
  if (branchName == "master") {
    run_script_stream(req, res, false);
  } else {
    console.log("No action for branch " + branchName + ".")
  }
})

app.get('/humla/', (req, res) => {
   run_script_stream(req, res, true);
})

app.listen(port, () => {
  console.log(`GitHub WebHook service listening at http://localhost:${port}`)
})
