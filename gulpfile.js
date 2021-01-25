// significant changes coming

const {
  series,
  src,
  dest,
  watch,
  parallel
} = require("gulp");
const gulpInline = require("gulp-inline-css");
const sass = require('gulp-sass');
const nunjucksRender = require("gulp-nunjucks-render");
const htmlmin = require('gulp-html-minifier');
const dom = require('gulp-dom');
const browserSync = require("browser-sync");
const server = browserSync.create();

sass.compiler = require('node-sass');



function copy() {
  return src('./src/assets/*.+(png|jpg|gif|jpeg)')
    .pipe(dest('./dist/assets/'))
}

/* 

 * Standard Nunjucks script:
  * - Run when the default `gulp` script is run
    - Looks for files in the './src/pages/' folder
    - Runs it thorough the nunjucks function
    - Inlines css
    - and outputs the results here './dist/'
    - streams changes to browser-sync instance invoked by the `gulp` script
*/

function nunjucks() {
  return src('./src/pages/*.+(html|nunjucks|njk)')
    .pipe(
      nunjucksRender({
        path: ["./src/templates"]
      }))
    .pipe(
      gulpInline({
        preserveMediaQueries: true,
        applyWidthAttributes: true,
        removeLinkTags: false,
      }))
    .pipe(dest('./dist'))
    .pipe(browserSync.stream());
}

/* 

 * Code Perfect Specific Nunjucks script:
  - Looks for files in the './src/pages/modules/' folder
  - Runs it thorough the nunjucks function
  - Minifies the html
  - and outputs the results here './dist/modules' 

*/

/* 

* Function that loops through a node list of elements with a 
* [data-type] attribute, and appends another [data="#"] attribute
* with it's respective array index number.

*/
function getDataAttributes() {
  this.querySelectorAll('[data-type]').forEach((cell, index) => {
    const span = this.querySelector('span');
    
    if(span === null) return;
    
    const attr = span.getAttribute('data');
    cell.setAttribute('data', `${attr}${index}`);
  });
  return this;
}

/* 

* Function that creates individual `html` module files 
* referenced in `src > pages > modules` and 
* outputs them into the `dist > modules` folder.
  ! No Attributes
*/
function runNunjucksNoAttributes() {
  return src('./src/pages/modules/*.+(html|nunjucks|njk)')
    .pipe(
      nunjucksRender({
        path: ["./src/templates"]
      }))
    .pipe(
      gulpInline({
        preserveMediaQueries: true,
        applyWidthAttributes: true,
        removeLinkTags: true,
      }))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(dest('./dist/modules'))
}

/* 

* Function that creates individual `html` module files 
* referenced in `src > pages > modules` and 
* outputs them into the `dist > modules` folder.
  ! With Attributes
*/
function runNunjucksWithAttributes() {
  return src('./src/pages/modules/*.+(html|nunjucks|njk)')
  .pipe(
    nunjucksRender({
      path: ["./src/templates"]
    }))
      .pipe(dom(getDataAttributes))
      .pipe(htmlmin({
        collapseWhitespace: true
      }))
    .pipe(dest('./dist/modules'))
}

// * Converts sass to css
function sassFn() {
  return src('./src/scss/styles.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./src/css'))
    .pipe(browserSync.stream());
}

// * Creates a browsersync instance
function browser_sync(done) {
  browserSync.init({
    server: {
      baseDir: "./dist",
      index: "index.html"
    }
  });
  done();
}

// * Watches for file changes in `src` folder
function watchFiles() {
  watch(
    [
      './src/scss/**/*.scss',
      './src/**/*.+(html|nunjucks|njk)'
    ], series(sassFn, nunjucks))
  watch('./src/assets/*.+(png|jpg|gif|jpeg)', copy)
}

// Default gulp variable
// * represents the `gulp` command
const watchFn = series(sassFn, nunjucks, parallel(watchFiles, browser_sync));

exports.default = watchFn;

exports.copy = copy;
exports.get_njk_modules = runNunjucksNoAttributes;
exports.get_njk_modules_atr = runNunjucksWithAttributes;