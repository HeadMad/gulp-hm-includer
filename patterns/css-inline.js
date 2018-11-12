module.exports = {
    expr: /<link .*href=(['"])(.+?)\1.*?\/? *>/,
    path: '$2',
    wrap: '<style>\n    {{}}\n</style>'
};