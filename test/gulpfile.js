const gulp = require('gulp');
const part = require('./index.js');

gulp.task('include', function () {
    return gulp.src('./build.html')
               .pipe(part({
                   pattern: /<include\s+src="(.+)"\s*\/?>/g
                }))
               .pipe(gulp.dest('../'))
});

gulp.task('watch', function() {
    gulp.watch('./**/*.html', ['include']);
});