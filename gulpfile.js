const gulp = require('gulp');
const part = require('./index.js');

gulp.task('includer', function () {
    return gulp.src('./test/build.html')
               .pipe(part({
                   pattern: /<include\s+src="(.+)"\s*\/?>/g
                }))
               .pipe(gulp.dest('./'))
});

gulp.task('watch', function() {
    gulp.watch('./test/**/*.html', ['includer']);
});