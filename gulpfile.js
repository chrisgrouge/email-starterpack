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

gulp.task("browserSync", function() {
  browserSync.init({
    server: {
      baseDir: "dist",
      index: "build-inline/build.html"
    }
  });
});

// Watchers
gulp.task("watch", ["gulpInline", "browserSync"], function() {
  gulp.watch(["src/build.html"], ["gulpInline"]);
  gulp.watch(["src/css/*.css"], ["gulpInline"]);
  gulp.watch("src/build.html").on("change", browserSync.reload);
});

gulp.task("default", ["watch"]);
