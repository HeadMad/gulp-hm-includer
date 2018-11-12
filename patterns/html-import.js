module.exports = {
    expr: /<import +href=(['"]?) *(.+?) *\1 *\/? *>/,
    path: '$2'
};