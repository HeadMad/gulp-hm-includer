module.exports = {
    expr: /<script .*src=(['"])(.+?)\1.*?> *<\/script>/,
    path: '$2',
    wrap: '<script>\n    {{}}\n</script>'
};