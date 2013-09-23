# Humla
Humla is an open source project of HTML5 presentation environment inspired by HTML5Rocks.

Similarly as Beamer exist for Latexers, Humla'a aim is to provide environment for creating slides for presentations in HTML while 
utilizing extensive HTML5 features. Humla is particularly 
useful for technical presentations and was originally created as a tool for the Czech Technical University courses Middleware and Web Services 
and Web 2.0. To see Humla in action, see <a href="http://humla.vitvar.com/slides/mdw/lecture1.html">Lecture 1 of 
Web Services and Middleware</a> course.

There is currently no IDE available, slides must be edited directly in HTML.

Feel free to fork Humla, write plugins and patch it yourself!

# Client 

  * Every slide has a unique URL.
  * Plugin architecture with views and extensions. 
  * A view defines how slides can be presented; there is currently a browsing view 
    for convenient slides browsing, a slideshow view for presentations, a grid view for overview of slides in a presentation,
    and a print view for printing slides.
  * An extension defines processing of slides' content such as for replacment of variables, online integration with pictures from 
    Google Drawing, online integration with github to display a code, Latex formulas, etc.

# Server
  
  * Humla server writen in node.js 
  * Supports: AJAX crawling of individual slides, server-side code for humla extensions (e.g. drawing retrieves Google drawing name).
  * Humla API: list all lectures, list content of a lecture, sitemap. 

# Browser Support

Humla currently works and is tested on the latest versions of Chrome and Safari. 

# Installation

Via git (or downloaded tarball):

    $ git clone git@github.com:tomvit/humla.git

After Humla has been downloaded, go to the humla directory and update submodules:

    $ git submodule update --init --recursive

# Usage

To run `test.html` in examples locally, you need to start your browser with options to run XHR on
local files. For example, to enable Chrome to run XHR on local files start it with the argument 
`--args --allow-file-access-from-files`. If you can access `test.html` at a Web server, 
just point your browser to it.

Use the following keys to navigate in the presentation:

  * `1` switches to the browser view
  * `2` switches to the slideshow view
  * `3` switches to the grid view
  * `4` or `p` switches to the print view
  * `left`, `right` goes to the previous and next slide respectively
  * `e` shows the last error if any
  * `d` toggles the debug mode

See <a href="http://humla.vitvar.com/slides/mdw/lecture1.html">Lecture 1 of Web Services and Middleware</a> 
course for more information on how Humla can be used for making presentations.

# Printing to PDF

Humla server supports printing of slides to PDF by using phantomjs. This requires installation of fonts 
at a node where the PDF generation occurs. The current Humla styles use Times New Roman 
for all text, Arial for text in tables and Consolas for code snippets.


# License
The GPL version 3, http://www.gnu.org/licenses/gpl.txt