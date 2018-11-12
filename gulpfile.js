const gulp = require('gulp');
const include = require('./index.js');

const props = {};
props.pattern = [];


// Использование готового шаблона из библиотеки
props.pattern.push( 'css-inline' );

// Строчный (жесткий) шаблон
props.pattern.push( {
    expr: '<import href="$PATH$"/>',
    path: '$PATH$',
} );

// Регулярное выражение в качестве шаблона - более гибкое решение
props.pattern.push( {
    expr: /<script .*src=(['"])(.+?)\1.*?> *<\/script>/g,
    path: '$2',
    wrap: '<script>\n    {{}}\n</script>'
} );


gulp.task( 'default', function () {
    return gulp.src( './test/build.html' )
            //    .pipe( include( { pattern: 'css-import' } ) )
               .pipe( include( props ) )
               .pipe( gulp.dest('./') )
});

gulp.task( 'watch', function () {
    gulp.watch( './test/**/*.?(html|css|js)', ['default'] );
});