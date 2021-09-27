// github-webhook service 
// @author: Tomas Vitvar, tomas@vitvar.com

const { workerData } = require('worker_threads');
const child_process = require('child_process');
const fs = require("fs")

var log = fs.createWriteStream(workerData.log_file, {flags : 'w'});

// prepare env variables for the script to run
var env = Object.assign(process.env, workerData.env)
env = Object.assign({ BUILD_ID: workerData.build_id }, env)

log.write(`Starting process webhook ${workerData.script}\n`);
var child = child_process.spawn(workerData.script, { env : env });

child.stdout.setEncoding('utf8');
child.stderr.setEncoding('utf8');

var log_output = function(data) {
  log.write(data);
}

child.stdout.on('data', log_output);
child.stderr.on('data', log_output);
child.on('close', function(code) {
  log.write(`The webhook ended with code ${code}.\n`);
  log.end()
});