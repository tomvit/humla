
var ex_rssfeed = {

    // event handler for slideprocess event
    processSlide : function(slide) {
        
        var displayFeed = function() {
            if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(this.responseText);
                var s = "";
                for (var i = 0; data.value.items && i < data.value.items.length; i++) {
                    s += "<li class=\"extref\"><a target=\"humla_reference\" class=\"ext-link\" href=\"" + data.value.items[i].link + 
                        "\">" + data.value.items[i].title + "</a>";
                }
                this._ul.innerHTML = s;
            }
        };
        
        var uls = slide.element.getElementsByClassName("h-rssfeed");
        for (var i = 0; i < uls.length; i++) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", uls[i].getAttribute("src"), true);
            xhr._ul = uls[i];
            xhr.onreadystatechange = displayFeed;
            xhr.send();
        }
    }
    
};
