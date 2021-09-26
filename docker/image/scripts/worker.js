// github-webhook service 
// @author: Tomas Vitvar, tomas@vitvar.com

const child_process = require('child_process');

console.log("Starting process webhook /opt/humla/scripts/publish-gh-pages.sh");
var child = child_process.spawn("/opt/humla/scripts/publish-gh-pages.sh");

child.stdout.setEncoding('utf8');
child.stdout.on('data', function(data) {
    process.stdout.write(data);
});

child.stderr.setEncoding('utf8');
child.stderr.on('data', function(data) {
    process.stdout.write(data);
});

child.on('close', function(code) {
   console.log("The script finished, the exit code="+code)
});
