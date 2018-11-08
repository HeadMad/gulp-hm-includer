module.exports = {
    expr: /<import\s+href="(.+)"\s*\/?>/g,
    path: '$1'
};