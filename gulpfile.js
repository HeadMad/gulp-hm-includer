const gulp = require('gulp');
const include = require('./index.js');

gulp.task('default', function () {
    return gulp.src('./test/build.html')
               .pipe(include({pattern:[
                   'javascript-inline',
                   'css-inline',
                   'html-import',
                   'css-import'
                ]}))
               .pipe(gulp.dest('./'))
});

gulp.task('watch', function() {
    gulp.watch('./test/**/*.?(html|css)', ['default']);
});