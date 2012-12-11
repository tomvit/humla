/**
* Lectures.js defines API methods to retrieve list of lectures and a lecture description.
*/

var fs = require("fs");
var crypto = require('crypto');
var path = require('path');
var exec = require('child_process').exec;

var PJS_LECCONTENTS = path.join(path.dirname(__filename), 'pjs_leccontents.js '); 
var PJS_ALLSLIDES   = path.join(path.dirname(__filename), 'pjs_allslides.js '); 

// Lectures class
var Lectures = function(config) {

	// config from config.json
	this.config = config;
	
	// internal in-memory cache for lecture descriptions
	this.cache = {};

	// retrieves all lectures from a set lectureSet
	this.getAllLectures = function(lectureSet, ondataready) {
		var lectures = fs.readdirSync(this.config.PUBLIC_HTML + "/slides/" + lectureSet);

		var alllectures = [];
		for (var i = 0; i < lectures.length; i++) {
			if (lectures[i].match("^lecture[0-9]+.html")) 
				alllectures.push({ 
					id 				: lectures[i],
					contents 	: "http://" + config.HOSTNAME.replace(/\/?$/, "") + "/api/lectures/" + lectureSet + "/" + 
										lectures[i] + "/contents",
					slides 		: "http://" + config.HOSTNAME.replace(/\/?$/, "") + "/api/lectures/" + lectureSet + "/" + 
										lectures[i] + "/slides",
					view 		: "http://" + config.HOSTNAME.replace(/\/?$/, "") + "/slides/" 		 + 
										lectureSet + "/" + lectures[i] } );					
		}

		alllectures.sort(function(a,b) {
			var p = new RegExp(/.*lecture([0-9]+).html.*$/);
			var m1 = p.exec(a.contents), m2 = p.exec(b.contents);
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
	
	// get the etags for the lecture set
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
	
	this.getAllSlides = function(lectureId, ondataready) {
	 	var lecture_url = "http://" + this.config.HOSTNAME + "/slides/" + lectureId;
	 	
	 	this.config.execute_pjs(PJS_ALLSLIDES, lecture_url, 
	 		function(data) {
	 			ondataready(JSON.parse(data), null);
	 		}, 
	 		function (error) {
	 			ondataready(null, error);
	 		}
	 	);
	}
	
	this.getAllSlides_etag = function(lectureid) {
		return null;
	}	
	
	// get a lecture description for lecture id
	this.getLectureContents = function(lectureId, ondataready) {
	 	var lecture_url = "http://" + this.config.HOSTNAME + "/slides/" + lectureId;
	 	
	 	var etag = this.getLectureContents_etag(lectureId);
	 	if (!this.cache[lectureId] || !this.cache[lectureId].data || this.cache[lectureId].etag != etag) {
	 		var cache = this.cache;
		 	this.config.execute_pjs(PJS_LECCONTENTS, lecture_url, 
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

	// get etag for the description of lecture lectureid
	this.getLectureContents_etag = function(lectureId) {
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