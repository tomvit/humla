
var fs = require("fs");
var crypto = require('crypto');
var path = require('path');
var exec = require('child_process').exec;

var PJS_LECTUREDESCR = path.join(path.dirname(__filename), 'pjs_lecturedescr.js '); 

var Lectures = function(config) {

	this.config = config;
	this.cache = {};

	// API methods, they must correspond to the definition in config.json	
	// retrieves all lectures from a set lectureSet
	this.getAllLectures = function(lectureSet, ondataready) {
		var lectures = fs.readdirSync(this.config.PUBLIC_HTML + "/slides/" + lectureSet);

		var alllectures = [];
		for (var i = 0; i < lectures.length; i++) {
			if (lectures[i].match("^lecture[0-9]+.html")) 
				alllectures.push({ 
					id 		: lectures[i],
					uri 	: "http://" + config.HOSTNAME.replace(/\/?$/, "") + "/api/lectures/" + lectureSet + "/" + lectures[i],
					lecture : "http://" + config.HOSTNAME.replace(/\/?$/, "") + "/slides/" 		 + lectureSet + "/" + lectures[i] } );					
		}

		alllectures.sort(function(a,b) {
			var p = new RegExp(/.*lecture([0-9]+).html$/);
			var m1 = p.exec(a.uri), m2 = p.exec(b.uri);
			if (m1 && m1.length > 0 && m2 && m2.length > 0) {
				an = parseInt(m1[1]);
				bn = parseInt(m2[1]);
				if (an < bn) return -1;
				if (an > bn) return +1;
				return 0;
			} else {
				if (a < b) return -1;
				if (a > b) return +1;
				return 0;
			}
		});			

		var result = { lectures: alllectures };
		if (ondataready)		
			ondataready(result);
		else
			return result;
	}
	
	this.getAllLectures_etag = function(lectureSet) {
		var al = this.getAllLectures(lectureSet, null);
		var md5sum = crypto.createHash('md5');
		for (var i = 0; i < al.lectures.length; i++) {
			var st = fs.statSync(this.config.PUBLIC_HTML + "/slides/" + 
				lectureSet + "/" + al.lectures[i].id);
			md5sum.update(st.mtime + "-"); 
		}
		return { etag: md5sum.digest('hex') };
	} 	
	
	this.getLectureData = function(lectureId, ondataready) {
	 	var lecture_url = "http://" + this.config.HOSTNAME + "/slides/" + lectureId;
	 	
	 	var etag = this.getLectureData_etag(lectureId);
	 	if (!this.cache[lectureId] || !this.cache[lectureId].data || this.cache[lectureId].etag != etag) {
	 		var cache = this.cache;
		 	this.config.execute_pjs(PJS_LECTUREDESCR, lecture_url, 
		 		function(data) {
		 			cache[lectureId] = { data: JSON.parse(data), etag : etag };
		 			ondataready(cache[lectureId].data, null);
		 		}, 
		 		function (error) {
		 			ondataready(null, error);
		 		}
		 	);
		} else
			ondataready(this.cache[lectureId].data, null);
	}

	this.getLectureData_etag = function(lectureId) {
		var st = fs.statSync(this.config.PUBLIC_HTML + "/slides/" + lectureId);
		if (st) {
			var md5sum = crypto.createHash('md5');
			md5sum.update(st.mtime + "");	
			return { etag: md5sum.digest('hex') };
		} else
			return null;		
	}	
}

exports.create = function(config) {
	return new Lectures(config);
}