// github-webhook service 
// @author: Tomas Vitvar, tomas@vitvar.com

var fs = require('fs');

var express = require('express')
const bodyParser = require('body-parser')
const { Worker } = require('worker_threads')

const app = express()

const TCP_PORT = 8080
const WORKER_SCRIPT = "/opt/humla/scripts/gh-webhook/publish-gh-pages.sh"

var jsonParser = bodyParser.json()

// helpers
var format_date = function(date) {
  if (!date)
    date = new Date()
  return date.toISOString().
    replace(/T/, ' ').  
    replace(/\..+/, '')   
}

var log = function(msg) {
  console.log(`[${format_date()}]: ${msg}`)
}

var send_status = function(res, code, msg) {
  log(msg)
  res.status(code).send(msg)
}

function run_worker(wh) {
  log_file = `/opt/humla/logs/gh-webhook-worker-${new Date().toISOString().replace(/[-,\:T\.]/g,'')}.log`
  log(`Running worker for ${wh.url}, the log file is ${log_file}`)
  var worker = new Worker('./worker.js', {
    workerData: { 
      script: WORKER_SCRIPT, 
      env: wh.env, 
      log_file: log_file }
  });
  wh.num_running++
  worker.on('exit', (code) => {
    wh.num_running--
    log(`The worker for ${wh.url} finished with code ${code}, re-run=${wh.re_run}`)
    if (wh.re_run) {
      wh.re_run = false
      run_worker(wh)
    }
  })      
}

// request logging
app.use((req, res, next) => {
  log(`${req.method} ${req.url}`)
  next()
})

log("gh-webhook, webhook script for GitHub push events")
log("Reading configuration from config.json")
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

log("Creating webhook endpoints...")
for (wh of config.web_hooks) {
  log(`- url: ${wh.url}`)
  wh["num_running"] = 0
  wh["re_run"] = false
  
  app.post(wh.url, jsonParser, (req, res) => {
    if (!req.body.ref) {
      send_status(res, 400, "Invalid input, cannot get 'ref' from the input payload!")
      return
    }
      
    log(`Received web hook request for branch '${req.body.ref}'`)
    var branchName = req.body.ref.split('/').slice(-1)[0]
    if (branchName == wh.branch) {
      if (wh.num_running == 0) {
        wh.run_again=false
        run_worker(wh)
        res.send("The gh-worker started.")
      } else {
        if (!wh.re_run) {
          wh.re_run=true
            send_status(res, 200, `The worker for ${wh.url} is already running and it was shceduled to re-run.`)
        } else 
          send_status(res, 400, `The worker for ${wh.url} is already running and has been already scheduled to re-run.`) 
      }
    } else 
      send_status(res, 400, `No action for branch ${branchName}.`)
  })
} 

app.listen(TCP_PORT, () => {
  log(`gh-webhook service listening at http://localhost:${TCP_PORT}`)
})

