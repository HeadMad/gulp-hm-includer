module.exports = {
    expr: /<script .*src=(['"])(.+?)\1.*?> *<\/script>/g,
    path: '$2',
    wrap: '<script>\n{{}}\n</script>'
};