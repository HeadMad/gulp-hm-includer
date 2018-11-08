module.exports = {
    expr: /@import\s+(?:url\()?\s*(?:["']?)\s*(.*?)\s*(?:["']?)\s*\)?\s*;/g,
    path: '$1'
};