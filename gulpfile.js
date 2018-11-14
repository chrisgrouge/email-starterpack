var gulp = require("gulp");
var gulpInline = require("gulp-inline-css");
var browserSync = require("browser-sync").create();

gulp.task("gulpInline", function() {
  gulp
    .src("src/build.html")
    .pipe(gulpInline({ preserveMediaQueries: true, applyWidthAttributes: true }))
    .pipe(gulp.dest("dist/build-inline"))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

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
gulp.task("watch", ["gulpInline", "browserSync"], function() {
  gulp.watch(["src/build.html"], ["gulpInline"]);
  gulp.watch(["src/css/*.css"], ["gulpInline"]);
});

gulp.task("default", ["watch"]);
