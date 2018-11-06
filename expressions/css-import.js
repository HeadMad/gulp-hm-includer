module.exports = {
    expr: /@import\s+(url\()?("|')?([^'"\)]+)("|')?\)?\s*;/g,
    path: '$3'
};