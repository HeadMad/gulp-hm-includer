module.exports = {
    expr: /@import\s+(url\()?\s*(["']?)\s*(.*?)\s*\2\s*\)?\s*;/g,
    path: '$3'
};