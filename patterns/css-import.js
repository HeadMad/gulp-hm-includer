module.exports = {
    expr: /@import +(?:url\()? *(["']?) *(.+?) *\1 *\)? *;/g,
    path: '$2'
};