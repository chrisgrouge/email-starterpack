const {
  series,
  src,
  dest,
  watch,
  parallel
} = require("gulp");
const gulpInline = require("gulp-inline-css");
const sass = require('gulp-sass')(require('sass'));
const nunjucksRender = require("gulp-nunjucks-render");
const htmlmin = require('gulp-html-minifier');
const dom = require('gulp-dom');
const browserSync = require("browser-sync");
const server = browserSync.create();
const replace = require('gulp-replace');
const gulpif = require('gulp-if');
const styleInject = require("gulp-style-inject");
const htmlbeautify = require('gulp-html-beautify');
const map = require('map-stream');
const merge = require('merge-stream');

sass.compiler = require('node-sass');

function copy() {
  return src('./src/assets/*.+(png|jpg|gif|jpeg)')
    .pipe(dest('./dist/assets/'))
}

/*

* LINE HEIGHT CONVERSION
* adding line height function to convert relative line height to pixels for mso-line-height-alt

*/
function LineHeight() {
  this.querySelectorAll("th[style], li, li > span, h1, h2, h3, h4, h5, h6, p").forEach((cell) => {

    var styles = cell.style.cssText;
    var lh = cell.style.lineHeight;
    var fs = cell.style.fontSize;

    // if line height does not include a pixel value
    if (!(lh.includes("px")) && lh != "") {
      // Remove all whitespaces from line height
      lh = lh.replace(/\s/g, "");
      // Remove all whitespaces from font size and the px
      fs = fs.replace(/\s/g, "").replace("px", "");

      // calculate the new line height value
      var calculate = Math.round(fs * lh);

      // concatenate new value with px and add that string as mso-line-height-alt
      cell.setAttribute("style", "mso-line-height-alt: " + calculate + "px; " + styles);
    } else {}
  });
}

/*

* KEEPING STYLES EMBEDED IN INLINE-STYLE ATTRIBUTE
* There are some instances where I'm adding an inline style as an attribute "inline-style". This stores the style and prepends it to the style tag before removing the "inline-style" attribute.

*/
function InlineStyles() {
  this.querySelectorAll("[inline-style]").forEach((cell) => {

    var styles = cell.style.cssText;
    var inlinestyle = cell.getAttribute('inline-style');

    cell.setAttribute("style", inlinestyle + " " + styles);
    cell.removeAttribute("inline-style");
  });
}

/*

* RBG COLOR CONVERSTION TO HEX
* I'm not sure why but sometimes the hex colors used in the SCSS file are converted to rgb.
* This function is in place to convert any font colors or bckground colors from rgb to hex.

*/
function colorToHex() {
  // convert rgb to hex function. We passed the rgb value through as "c"
  function rgb2hex(c) {
    // store the values between the two parenthesis rgb(...)
    var rgb = c.split("(")[1].split(")")[0];
    // split the values at the comma
    rgb = rgb.split(",");
    //For each array element
    var hex = rgb.map(function(x){
      //Convert to a base16 string             
      x = parseInt(x).toString(16);
      //Add zero if we get only one character         
      return (x.length==1) ? "0"+x : x;       
    })
    // Send the values back after joining them together.
    // Example: rgba(0,0,0); gets sent back as "000000".
    return hex = hex.join("");
  }

  // change font color
  this.querySelectorAll("[style*='color']").forEach((cell) => {
    var color = cell.style.color;
    // if the color returns a value and includes "rgb(" in the string, proceed.
    // I'm looking for "rgb(" to exclude anything that has "rgba(".
    if (color.length && color.includes("rgb\(")) {
      // remove the current color
      cell.style.color = "";
      // store all styles
      var styles = cell.style.cssText;
      // send the rgb value through to the function
      var newhex = rgb2hex(color);
      // combine the new color hex with the proper # symbol and assign that as the color value.
      // append all the remaining styles after new color hex code has been set.
      // I have to do it this way because cell.style.color will auto convert the hex code back to rgb.
      cell.setAttribute("style", "color: " + "#"+newhex+";" + styles);
    }
  });

  // change background color
  this.querySelectorAll("[style*='background-color']").forEach((cell) => {
    var bgcolor = cell.style.backgroundColor;
    // if the color returns a value and includes "rgb(" in the string, proceed.
    // I'm looking for "rgb(" to exclude anything that has "rgba(".
    if (bgcolor.length && bgcolor.includes("rgb\(")) {
      // remove the current background color
      cell.style.backgroundColor = "";
      // store all styles
      var styles = cell.style.cssText;
      // send the rgb value through to the function
      var newhex = rgb2hex(bgcolor);
      // combine the new color hex with the proper # symbol and assign that as the background color value.
      // append all the remaining styles after new color hex code has been set.
      // I have to do it this way because cell.style.backgroundColor will auto convert the hex code back to rgb.
      cell.setAttribute("style", "background-color: " + "#"+newhex+"; " + styles);
    }
  });
}

/* 

 * Standard nunjucks render script:
  * - Runs when called upon in "pages" and "modules" functions
    - I'm passing the source as a variable "path"
    - Runs it thorough the nunjucks render
    - Inlines css
    - a few replacing tasks to remove unneccesary selectors
    - run lineHeight function
    - run InlineStyles function
    - run colorHex function
    - remove all instances of tbody tag
*/
var inline = function(path) {
  return src(path)
  .pipe(
    nunjucksRender({
      path: ["./src/html"]
    }))
  .pipe(
    gulpInline({
      preserveMediaQueries: true,
      applyWidthAttributes: true,
      removeLinkTags: true,
      removeStyleTags: false,
      removeHtmlSelectors: true
    }))
  .pipe(replace(/inline-id="(.*)"/g, 'id="$1"'))
  .pipe(replace(/inline-class="(.*)"/g, 'class="$1"'))
  .pipe(replace(/inline-class="(.*)"/g, 'class="$1"'))
  .pipe(replace(/inline-font-weight: (.*);/g, 'font-weight: $1;'))
  .pipe(replace(/inline-font-weight: (.*);/g, 'font-weight: $1;'))
  .pipe(dom(LineHeight))
  .pipe(dom(InlineStyles))
  .pipe(dom(colorToHex))
  .pipe(replace(/<tbody>/g, ''))
  .pipe(replace(/<\/tbody>/g, ''))
  // &zwnj; has to be below any of the dom() functions because the dom renders the non breaking space and removes it on destination to dist folder
  .pipe(replace('&amp;zwnj;', '&zwnj;'))
  .pipe(replace('<!--[endif]---->', '<![endif]-->'))
}


/* 

 * Standard pages render script:
  * - Run when the default `gulp` script is run
    - Passing the source of where the pages live ".src/pages"
    - Runs it thorough the inline render function (above)
    - Inject the style tags where noted in the base.njk file (this is for desktop and mobile <style> tags)
    - Beautify the file with 2 indents but ignore the <head>
    - Outputs the results here './dist'
    - streams changes to browser-sync instance invoked by the `gulp` script
*/
function pages() {
  modules();
  var path = './src/pages/*.+(html|nunjucks|njk)';
  return inline(path)
  .pipe(styleInject({
    encapsulated: true,
    path: './src'
  }))
  .pipe(htmlbeautify({
    indent_size: 2,
    unformatted: ['head']
  }))
  .pipe(dest('./dist'))
  .pipe(browserSync.stream());
}


/* 

 * Standard Modules script:
  * - Run 'gulp modules' in terminal
    - Runs the function newfile()
    - Once all modules have been placed in the new modules folder:
      - Runs it thorough the inline render function
      - Minify the file (for easier find and replace)
      - Find and replace the rendered wrapping document tags
        - The dom() portion of the inline render function creates the base html. I only need to keep the module structure as it was built so I find and replace the unneccessary code.
      - Beautify the file with 2 indents but ignore the <head>
      - Outputs the results here './dist/modules'
*/

function modules() {
  newfile();
  var path = './src/pages/modules/*.+(html|nunjucks|njk)';
  return inline(path)
  .pipe(htmlmin({
    collapseWhitespace: true
  }))
  .pipe(replace('<html><head></head><body><table id="remove">', ''))
  .pipe(replace('</table></body></html>', ''))
  .pipe(htmlbeautify({
    indent_size: 2
  }))
  .pipe(dest('./dist/modules'))
}

/* 

  * Creates individual module files for all of your body modules
  - searches in the body modules folder where it returns the file name. The file name is then used to create the individual module with style sheet, block, module name.

*/
function newfile() {
  return src('./src/html/modules/body/*.+(html|nunjucks|njk)')
    .pipe(map(function(file, cb) {
      // removed fileContents becuase it's not needed but this can access any of the files contentents
      // var fileContents = file.contents.toString();
      var fileName = file.basename.toString();
      // --- do any string manipulation here ---
      fileContents = '<link rel="stylesheet" href="../../css/styles.css">\n<table id="remove">{% block content %}\n{% include "modules/body/'+fileName+'" %}\n{% endblock %}</table>';
      // ---------------------------------------
      file.contents = new Buffer.from(fileContents);
      cb(null, file);
    }))
    .pipe(dest('./src/pages/modules'))
}


// * Converts sass to css
function sassFn() {
  return src('./src/scss/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(dest('./src/css'))
    .pipe(browserSync.stream());
}

// * Creates a browsersync instance
function browser_sync(done) {
  browserSync.init({
    server: {
      baseDir: "./dist",
      index: "master-template.html"
    }
  });
  done();
}

// * Watches for file changes in `src` folder
function watchFiles() {
  watch(
    [
      './src/scss/**/*.scss',
      './src/html/**/*.+(html|nunjucks|njk)'
    ], series(sassFn, pages))
  watch('./src/assets/*.+(png|jpg|gif|jpeg)', copy)
}


// Default gulp variable
// * represents the `gulp` command
const watchFn = series(sassFn, pages, parallel(watchFiles, browser_sync));

exports.default = watchFn;

exports.copy = copy;
exports.modules = modules;
exports.newfile = newfile;