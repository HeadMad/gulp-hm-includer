const gulp = require('gulp');
const part = require('./index.js');

gulp.task('default', function () {
    return gulp.src('./test/build.html')
               .pipe(part({
                   pattern: {
                       expr: /<include(me)?\s+src="(.+)"\s*\/?>/g,
                       path: '$2'
                   }
                }))
               .pipe(gulp.dest('./'))
});

gulp.task('watch', function() {
    gulp.watch('./test/**/*.html', ['default']);
});