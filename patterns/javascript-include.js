module.exports = {
    expr: /<script .*src=(['"])(.+?\.js)\1.*?> *<\/script>/g,
    path: '$2',
    before: '<script>\n',
    indent: '    ',
    after: '\n</script>'
};