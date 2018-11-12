module.exports = {
    expr: /@import +(?:url\()? *(["']?)(.+?)\1 *\)? *;/,
    path: '$2'
};