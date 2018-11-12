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


let string = `Lorem ipsum dolor sit amet consectetur adipisicing elit
        Illo aliquam illum hic quae magnam, dolores est suscipit fugit quo impedit sint,
    quisquam quaerat temporibus culpa recusandae quod,
cupiditate consequuntur similique.`;

let bufer = [];
gulp.task('test', callback => {
    string.replace(/(dol)|(amet)|(est)|(simi)[^\n]/g, (str, ...search) => {
        let inputs = search.slice(0,-1);
        inputs.some((input, i) => {
            if (input === undefined) {
                return false;
            }

            if (bufer.indexOf(input) !== -1) {
                console.log('This file was included before:', input);
                return false;
            }

            bufer.push(input);
            let expr = new RegExp('^\\n?([^\\n\\S]+)?.*?' + input, 'm');

            console.log(string.match(expr));


        });
        console.log('-----------');
    })
    callback();
})