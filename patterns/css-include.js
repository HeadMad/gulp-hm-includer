module.exports = {
    expr: /<link .*href=(['"])(.+?)\1.*?\/? *>/g,
    path: '$2',
    wrap: '<style>\n    {{}}\n</style>'
};