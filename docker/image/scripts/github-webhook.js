// github-webhook service 
// @author: Tomas Vitvar, tomas@vitvar.com

const express = require('express')
const bodyParser = require('body-parser')
const { Worker } = require('worker_threads')

const app = express()
const port = 8080

var jsonParser = bodyParser.json()

var num_running = 0
var run_again = false

if (!process.env.GITHUB_REPO)
  throw "The env variable GITHUB_REPO is not defined!"
  
var repo_name = process.env.GITHUB_REPO.split("/").slice(-1)[0]  

let reqLogger = (req, res, next) => {
  let dt = new Date();
  let fdt = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate() + 
    " " + dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() 
  console.log(`*** [${fdt}]: ${req.method} ${req.url}`)
  next()
}

app.use(reqLogger)

function run_worker() {
  var worker = new Worker('./worker.js')
  num_running++
  worker.on('exit', (code) => {
    num_running--
    if (run_again) {
      run_again = false
      run_worker()
    }
  })      
}

app.post('/humla/'+repo_name, jsonParser, (req, res) => {
  console.log("Received WebHook request for " + req.body.ref)
  branchName = req.body.ref.split('/').slice(-1)[0]	
  if (branchName == "master") {  
    if (num_running == 0) {
      run_again=false
      run_worker()
      res.send('The worker started.')
    } else
      if (!run_again) {
        run_again=true
        res.send("The worker is already running and it was shcedulled to run one more time.")
      } else 
        res.send("The worker is already running and is already scheduled to run again.") 
  } else {
    console.log("No action for branch " + branchName + ".")
  }
})

app.listen(port, () => {
  console.log(`GitHub WebHook service serving ${process.env.GITHUB_REPO} is listening at http://localhost:${port}`)
})
