// github-webhook service 
// @author: Tomas Vitvar, tomas@vitvar.com

var fs = require('fs');

var express = require('express')
var cookieParser = require('cookie-parser')

const app = express()

const TCP_PORT = 8080

var masters = []

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

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(cookieParser())

// request logging
app.use((req, res, next) => {
  log(`${req.method} ${req.url}`)
  next()
})

// utils
function make_id(length, chars) {
  var result = '';
  if (chars == null)
    chars = '0123456789';
  var l = chars.length;
  for (var i = 0; i < length; i++)
    result += chars.charAt(Math.floor(Math.random() * l));
  return result;
}

function find_master(id) {
  for (m of masters)
    if (m.id == id)
      return m
  return null
}

function get_master_id_cookie(req) {
  if (req.headers.cookie != null) {
    var cookies = req.headers.cookie.split('; ')
    for (cookie of cookies) {
      var kv = cookie.split('=')
      if (kv[0] == 'master_id')
        return kv[1]
    }
  }
  return null
}

function remove_follower(followers, id) {
  for (var inx = 0; inx < followers.length; inx++) {
    if (followers[inx].id == id) {
      log(`Ending follower '${followers[inx].id}'`)
      followers[inx].res.end()
      followers.splice(inx, 1);
      return
    }
  }
}

function handle_follower_end(master, follower_id, req1) {
  setTimeout(() => remove_follower(master.followers, follower_id), 60000)
  req1.on('close', () => {
    log(`Connection closed. Removing the follower '${follower_id}'`)
    remove_follower(master.followers, follower_id)
  })
}

log("follow service, follow slides presentation from master")

app.post('/masters', (req, res) => {
  // check if master exist on the master_id provided using the cookie
  var master = null
  var master_id = get_master_id_cookie(req)
  if (master_id != null) {
    log(`There is master_id=${master_id} provided in the cookie, checking if it exists...`)
    master = find_master(master_id)
    if (master == null)
      log(`The master with id ${master_id} does not exist.`)
    else
      log(`The master with id ${master_id} exists, will use this master.`)
  }

  // register master if has not been found
  if (master == null) {
    master = {
      id: make_id(4),
      hostname: null,
      path: null,
      slide: null,
      followers: []
    }
    masters.push(master)
    log(`A new master with id ${master.id} was created.`)
  }

  // construct the set-cookie domain parameter 
  domain = ""
  if (req.get('Host') != null)
    domain = `Domain=${req.get('Host')}; `

  // send response 
  res.writeHead(200, {
    'Location': `/masters/${master.id}`,
    'Access-Control-Allow-Origin': req.get('Origin'),
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Expose-Headers': 'Location',
    'Set-Cookie': `master_id=${master.id}; ${domain}SameSite=None; Secure`
  });
  res.send()

  // this is where followers will get updates on slide number
  app.get(`/masters/${master.id}`, (req1, res1) => {
    id = req1.url.split('/')[2]
    master = find_master(id)
    res1.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET'
    })
    follower_id = make_id(4, 'abcdefghijkl_')
    log(`Starting follower '${follower_id}'`)
    master.followers.push({
      id: follower_id,
      res: res1
    })

    if (master.slide != null) {
      var data = `data: {"master": "${master.id}", "hostname": "${master.hostname}", "path": "${master.path}", "slide": "${master.slide}"}\n\n`;
      res1.write(data)
    }

    handle_follower_end(m, follower_id, req1)
  });

  // pre-flight request for PUT
  app.options(`/masters/${master.id}/slide`, (req1, res1) => {
    res1.writeHead(200, {
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT',
      'Access-Control-Max-Age': '86400'
    })
    res1.send()
  });

  // this is where the master will report the slide numbers
  app.put(`/masters/${master.id}/slide`, (req1, res1) => {
    id = req1.url.split('/')[2]
    master = find_master(id)
    if (master == null) {
      send_status(res1, 404, `Cannot find master with id ${id}!`)
      return
    }
    master.hostname = req1.body.hostname
    master.path = req1.body.path
    master.slide = req1.body.slide
    var data = `data: {"master": "${master.id}", "hostname": "${master.hostname}", "path": "${master.path}", "slide": "${master.slide}"}\n\n`;

    res1.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Max-Age': '86400',
      'Connection': 'keep-alive',
    })
    res1.send()

    log(`Updating ${master.followers.length} followers`)
    for (var inx = 0; inx < master.followers.length; inx++) {
      master.followers[inx].res.write(data)
    }
  });

})

app.listen(TCP_PORT, () => {
  log(`gh-webhook service listening at http://localhost:${TCP_PORT}`)
})