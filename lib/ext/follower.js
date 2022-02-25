
var ex_follower = {
    
    base_url: "https://humla-follow.vitvar.com",
    
    master_url : null,
    master_id: null,
    follow_id : null,
    
    
    load : function() {
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
            url: this.base_url + "/masters",
            xhrFields: {
              withCredentials: true
            },        
            success: (data, status, request) => {
              _location = request.getResponseHeader('Location')
              var re = new RegExp("^/masters/([0-9]+)$", "g");
              var match = re.exec(_location);
              this.master_url = this.base_url + _location + "/slide"
              this.master_id = match[1]
              this.enterSlide(humla.currentSlide)
            }
          });        
        }
        
        if (follow_id != null) {
          this.follow_id = follow_id
          _url = this.base_url + "/masters/" + this.follow_id
          var source = new EventSource(_url);
          source.onmessage = function(event) {
            data = JSON.parse(event.data)
            var _url = new URL(window.location);
            if (_url.pathname == data.path)
              humla.controler.goto(data.slide)
            else {
              urlstr = data.path + '?follow=' + data.master + "#/" + data.slide + "/v2"
              window.location = urlstr
            }
          };
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
    
    enterSlide : function(slide) {
      if (this.master_url != null) {
        var url = new URL(window.location);
        var re = new RegExp("^#/([0-9a-zA-Z_]+).*", "g");
        var match = re.exec(url.hash);
        var slide = humla.findSlide(match[1])
        data = {"hostname": url.hostname, "path": url.pathname, "slide": slide.number}
        $.ajax({
          type: "PUT",
          url: this.master_url,
          data: data
        });                
      }
    }
};