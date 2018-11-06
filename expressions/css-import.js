module.exports = {
    expr: /@import\s+["|'](.+)["|']\s*;/g,
    replace: '$1'
};