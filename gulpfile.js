var gulp = require("gulp");
var gulpInline = require("gulp-inline-css");
var browserSync = require("browser-sync").create();
var imagemin = require("gulp-imagemin");


//Image compression
gulp.task("imagemin", function() {
  gulp
    .src("src/assets/*")
    .pipe(imagemin())
    .pipe(gulp.dest('dist/assets'));
});


// Automatic Inlining
gulp.task("gulpInline", function() {
  gulp
    .src("src/build.html")
    .pipe(gulpInline({ preserveMediaQueries: true, applyWidthAttributes: true, removeLinkTags: false }))
    .pipe(gulp.dest("dist/build-inline"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});


//Browser-syncing 
gulp.task("browserSync", runSync);

function runSync() {
  setTimeout(function() {
    browserSync.init({
      server: {
        baseDir: "src",
        index: "build.html"
      }
    });
  }, 500);
}

// Watchers
gulp.task("watch", ["gulpInline", "browserSync", "imagemin"], function() {
  gulp.watch(["src/build.html"], ["gulpInline"]);
  gulp.watch(["src/css/*.css"], ["gulpInline"]);
  gulp.watch(["src/assets/*"], ["imagemin"]);
});

gulp.task("default", ["watch"]);
