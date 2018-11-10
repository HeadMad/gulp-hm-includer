module.exports = {
    expr: /<link .*href=(['"])(.+?)\1.*?\/? *>/g,
    path: '$2',
    before: '<style>\n',
    indent: '    ',
    after: '\n</style>'
};