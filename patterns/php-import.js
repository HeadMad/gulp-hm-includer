module.exports = {
    expr: /<\?(?:php)? +(?:require|include)(?:_once)? *\(? *(['"]?) *(.+?) *\1 *\)? *;? *\?>/,
    path: '$2'
};