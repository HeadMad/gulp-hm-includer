const gulp = require('gulp');
const include = require('./index.js');

gulp.task('default', function () {
    return gulp.src('./test/build.html')
               .pipe(include({
                   pattern: {
                       expr: '<include src="{{path}}"/>',
                       path: '{{path}}',
                   }
                }))
               .pipe(include({pattern: 'css-import'}))
               .pipe(gulp.dest('./'))
});

gulp.task('watch', function() {
    gulp.watch('./test/**/*.html', ['default']);
});