

// Lectures class
var Sitemap = function(config) {

	this.config = config;
	
	this.getSitemap = function(ondataready) {
		// search for lectures handler
		var lectures = this.config.searchHandler("lectures");
		
		if (lectures) {
			var al1 = lectures.getAllLectures("mdw");
			var al2 = lectures.getAllLectures("w20");
			var al = al1.lectures.concat(al2.lectures);
			var numplec = 0;
			var slides = [];
			
			var processEnd = function() {
				var sm = '<?xml version="1.0" encoding="utf-8"?>\n';
				sm += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
				
				for (var i = 0; i < slides.length; i++) {
					sm += '<url>\n';
					sm += '<loc>' + slides[i] + '</loc>\n';
					sm += '</url>\n';
				}
				sm += '</urlset>\n';
				
				ondataready(sm, null, 'application/xml');
			}
			 
			for (var i = 0; i < al.length; i++) {
				var p = new RegExp(/.*\/(.*\/lecture[0-9]+\.html).*/);
				var m = p.exec(al[i].contents);
				lectures.getAllSlides(m[1], 
					function(data, error) {
						if (!error) {
							for (var j = 0; j < data.slides.length; j++)
								slides.push(data.slides[j]["slide-url"]);
						}
						numplec++;
						if (numplec == al.length)
							processEnd();
					});
			}
		} else
			ondataready(null, "Error retrieving a handler for lectures");
	}
	
	this.getSitemap_etag = function() {
		return null;
	}
}

exports.create = function(config) {
	return new Sitemap(config);
}

