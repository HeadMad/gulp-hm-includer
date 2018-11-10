const gulp = require('gulp');
const include = require('./index.js');

gulp.task('default', function () {
    return gulp.src('./test/build.html')
               .pipe(include({pattern: 'javascript-include'}))
               .pipe(include({pattern: 'css-include'}))
            //    .pipe(include({pattern: 'html-import'}))
            //    .pipe(include({pattern: 'css-import'}))
               .pipe(gulp.dest('./'))
});

gulp.task('watch', function() {
    gulp.watch('./test/**/*.?(html|css)', ['default']);
});