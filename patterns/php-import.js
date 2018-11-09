module.exports = {
    expr: /<\?(?:php)? +(?:require|include)(?:_once)? *(?:\()? *(['"]?) *(.+?) *\1 *(?:\))? *;? *\?>/g,
    path: '$2'
};