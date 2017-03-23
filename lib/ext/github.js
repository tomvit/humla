
function refreshGithubCode(id) {
    var e = humla.utils.document.getElementById(id);
    e.style.opacity = "0.3";
    if (humla.utils.window.localStorage)
        humla.utils.window.localStorage.removeItem(e.config.storageKey);
    e.config.refresh();
}

var ex_github = {
    
    processSlide : function(slide) {
        var el = slide.element.getElementsByClassName("h-github"), i = 0;
        
        if (el.length > 0) {
            if (!this.config.params || !this.config.params.url) {
                throw "Base URL for github has not been specified!";
                return;
            }
            
            var updateCode = function(code) {
                var fc = code ? code : "";
                if (fc === "") {
                    // create empty code with the same size as the resulting code
                    for (var i = 0; i < this.lineTo - this.lineFrom + 2; i++)
                        fc += " \n";
                    this.element.style.opacity = "0.3";
                } else {
                    var s = fc.split("\n"), fc = "";
                    for (var i = this.lineFrom - 1; i < this.lineTo; i++)
                        if (i < s.length)
                            fc += s[i] + "\n";
                    this.element.style.opacity = "1";   
                }
                this.pre.innerHTML = fc.replace(/</g, "&lt;");
                this.element.innerHTML = "";
                this.element.appendChild(this.pre);
                SyntaxHighlighter.highlight(null, this.pre);
                
                var shl = this.element.getElementsByClassName("syntaxhighlighter");
                if (shl && shl.length > 0) {
                    shl[0].tb = config.tb;
                    shl[0].setAttribute("onmouseover", "this.tb.className = 'toolbar2-visible'");
                    shl[0].setAttribute("onmouseout",  "this.tb.className = 'toolbar2'");
                    shl[0].appendChild(config.tb);
                }                
            };

            var refreshCode = function() {
                var xhr = new XMLHttpRequest();
                xhr.config = this;
                xhr.open("GET", xhr.config.url, true);
                xhr.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        if (this.config.cid.toLowerCase() != "master" && humla.utils.window.localStorage) {
                            humla.utils.window.localStorage.setItem(this.config.storageKey, this.responseText);
                        }
                        this.config.update(this.responseText);
                    }
                }
                xhr.send();            
            };
            
            for (var i = 0; i < el.length; i++) {
                // get attributes
                var config = {
                    element : el[i],
                    cid     : el[i].getAttribute("cid") ? el[i].getAttribute("cid") : "master",
                    brush   : el[i].getAttribute("brush") ? el[i].getAttribute("brush") : null, 
                    urepo   : el[i].getAttribute("user-repo") ? el[i].getAttribute("user-repo") : this.config.params["user-repo"],
                    name    : el[i].getAttribute("name") ? el[i].getAttribute("name") : null,
                    conf    : el[i].getAttribute("config") ? el[i].getAttribute("config") : "",
                    lines   : el[i].getAttribute("lines") ? el[i].getAttribute("lines") : "1-100"                    
                };
                
                if (!config.name)
                    throw "The name attribute is missing on h-github!";

                if (!config.urepo) 
                    throw "User and repository have not been specified, parameter 'user-repo'";

                config.element.config = config;
                if (!config.brush)
                    config.brush = ((p = config.name.match("^.*\\.(.*){1,5}$"))) ? p[1] : null;

                config.storageKey = "h-github-" + config.name + "-" + config.cid;
                config.id = config.storageKey + "-" + (Math.floor(Math.random()*100));
                config.element.setAttribute("id", config.id);
                
                config.lineFrom = ((l = config.lines.match("^\s*([0-9]{1,3}).*"))) ? 
                    parseInt(l[1]) : 1;
                config.lineTo = ((l = config.lines.match(".*\-\s*([0-9]{1,3})\s*$"))) ? 
                    parseInt(l[1]) : 99;

                if (config.lineTo > 100) {
                    if (!config.conf)
                        config.conf = "class-name : 'over100'";
                    else
                        config.conf += "; class-name : 'over100'";
                }

                //config.url = this.config.params.url + "/" + config.urepo + "/" + config.cid + "/" + config.name;   
		config.url = "https://raw.githubusercontent.com/" + config.urepo + "/" + config.cid + "/" + config.name;             
                config.pre = humla.utils.document.createElement("pre");
                config.pre.setAttribute("class", (config.brush ? "brush: " + config.brush : "") + 
                    "; first-line: " + config.lineFrom + (config.conf ? "; " + config.conf : ""));

                // toolbar
                config.tb = humla.utils.document.createElement("div");
                config.tb.setAttribute("class", "toolbar2");
                config.tb.innerHTML = "<a class='icon' target='github-source' title='See source at github' href='https://github.com/" + 
                    config.urepo + "/blob/" + config.cid + "/" + config.name + "#L" + 
                    config.lineFrom + "-" + config.lineTo +"'><i class=\"material-icons\">open_in_new</i></a>";
                config.tb.innerHTML += "<a class='icon' title='Refresh' href='javascript:refreshGithubCode(\"" + 
                    config.id + "\");'><i class=\"material-icons\">replay</i></a>";

                config.update = updateCode;
                
                var code;
                if (config.cid.toLowerCase() !== "master" && humla.utils.window.localStorage) {
                    code = humla.utils.window.localStorage.getItem(config.storageKey);
                }                
                config.update(code);
                
                config.refresh = refreshCode;
                if (!code)
                    config.refresh();
            }
        }            
    }
};
