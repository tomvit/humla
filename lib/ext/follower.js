// follower extension
var ex_follower = {

  // URL of the master to report slide changes 
  master_url: null,
  
  // id of the master 
  master_id: null,
  
  // id of the master to follow
  follow_id: null,

  load: function() {
    var urlParams = new URLSearchParams(window.location.search);
    var follow_id = urlParams.get('follow');
    var master = urlParams.get('master');

    if (follow_id != null && master != null) {
      humla.reportError("Only master or follow parameters can be specified!")
      return
    }

    if (master != null) {
      this.master_url = master

      // get master url to report slide information
      $.ajax({
        type: "POST",
        url: this.config.params.follow_service + "/masters",
        xhrFields: {
          withCredentials: true
        }
      }).then((data, status, request)=>{
        _location = request.getResponseHeader('Location')
        var re = new RegExp("^/masters/([0-9]+)$", "g");
        var match = re.exec(_location);
        this.master_url = this.config.params.follow_service + _location + "/slide"
        this.master_id = match[1]
        this.enterSlide(humla.currentSlide)        
      });

      // report current slide when the visibility changes
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) 
          this.enterSlide(humla.currentSlide)
      }, false);

    }

    if (follow_id != null) {
      this.follow_id = follow_id
      _url = this.config.params.follow_service + "/masters/" + this.follow_id
      var source = new EventSource(_url);
      source.onmessage = function(event) {
        data = JSON.parse(event.data)
        
        if (window.location.hostname != data.hostname) {
          humla.showMessage("The hostname from the master does not match the local hostname!", true, false)
          source.close()
          return
        }
        
        var _url = new URL(window.location);
        if (_url.pathname == data.path)
          humla.controler.goto(data.slide)
        else {
          new_url = data.path + '?follow=' + data.master + "#/" + data.slide + "/v" + humla.controler.currentView.config.id
          window.location = new_url
        }
      };
      source.onerror = function() {
        //humla.showMessage("Error occured when running the follow process with master id " + follow_id, true, false)
      }
      
    }
  },

  keydown: function(event) {
    if (event.keyCode === 70) {
      if (this.master_url != null)
        humla.showMessage("Reporting slide changes to the master ID <b>" + this.master_id + "</b>", false, true)
      if (this.follow_id != null)
        humla.showMessage("Following slide changes at the master ID <b>" + this.follow_id + "</b>", false, true)
    }
  },

  enterSlide: function(slide) {
    if (this.master_url != null) {
      var url = new URL(window.location);
      var match = new RegExp("^#/([0-9a-zA-Z_]+).*", "g").exec(url.hash);
      var slide = humla.findSlide(match ? match[1] : "")
      if (slide != null) {
        $.ajax({
          type: "PUT",
          url: this.master_url,
          data: {
            "hostname": url.hostname,
            "path": url.pathname,
            "slide": slide.number
          }
        });
      }
    }
  }
};