var gulp = require("gulp");
var juice = require("gulp-juice");
var browserSync = require("browser-sync").create();

gulp.task("juice", function() {
  gulp
    .src("src/build.html")
    .pipe(juice({ preserveMediaQueries: true, applyWidthAttributes: true }))
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
gulp.task("watch", ["juice", "browserSync"], function() {
  gulp.watch(["src/build.html"], ["juice"]);
  gulp.watch(["src/css/*.css"], ["juice"]);
  gulp.watch("src/build.html").on("change", browserSync.reload);
});

gulp.task("default", ["watch"]);
