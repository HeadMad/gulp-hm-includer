module.exports = {
    expr: /<import +href=(['"]?) *(.+?) *\1 *\/? *>/g,
    path: '$2'
};