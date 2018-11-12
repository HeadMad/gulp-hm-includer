const loger = require('hm-loger');
const logDanger = loger('danger');

const configFields = ['pattern'];

function typeOf ( arg ) {
    return Object.prototype.toString.call(arg).slice(8, -1);
}

/**
 * Трансформация паттерна
 * @param {object|string} pattern 
 */
function transformPattern ( pattern ) {

    const type = typeOf( pattern );

    // если передана строка
    if (type === 'String') {

        try {
            pattern = require('./patterns/' + pattern );
            return pattern;

        } catch (error) {
            logDanger('a non-existent pattern:', pattern );
            return false;
        }
    }

    // если передан не объект
    if (type !== 'Object') {
        return false;
    }

    // если не установлен паттерн или значение пути
    if ( !pattern.expr || !pattern.path ) {
        return false;
    }

    // если шаблон не регулярное выражение
    if ( pattern.expr instanceof RegExp ) {
        pattern.expr = new RegExp(pattern.expr.source);
        return pattern;
    }

    // если шаблон и не строка
    if (typeof pattern.expr !== 'string') {
        logDanger('Invalid format of property:', 'pattern.path');
        return false;
    }

    // если path не строка
    if (typeof pattern.path !== 'string') {
        logDanger('Invalid format of property:', 'pattern.path');
        return false;
    }

    // если в паттерне нет ключевого слова
    if (pattern.expr.indexOf(pattern.path) === -1) {
        logDanger('pattern.path must be a substring of the pattern.expr');
        return false;
    }

    // хеш для замены в выражении
    let path = Date.now();

    // переводим строку в регулярное выражение
    let expr = pattern.expr.replace(pattern.path, path)
        .replace(/\.|\^|\$|\*|\+|\?|\(|\)|\[|\]|\{|\}|\\|\|/g, '\\$&')
        .replace(path, '(.+?)');

    pattern.expr = new RegExp(expr);
    pattern.path = '$1';

    return pattern;

} // transformPattern




const Config = {

    import: function (params) {
        for (let key in params) {
            if (configFields.indexOf(key) === -1)
                continue;

            this[key] = params[key];
        }

    },



    set pattern( value ) {
        const type = typeOf(value);
        let stack = [];
        if (type === 'Array') {
            value.reduce(function (stack, item) {
                let result = transformPattern(item);
                if (result !== false) {
                    stack.push(result);
                }
                return stack;
            }, stack);
            
        } else {

            let result = transformPattern(value);
            if (result !== false) {
                stack.push(result);
            }
            
        }
        
        // если стек пуст
        if (stack.length === 0) {
            return;
        }
        let expr = stack.map( item => '(' + item.expr.source.replace(/\((?!\?:)/g, '(?:') + ')').join('|');
        
        this.expression = new RegExp(expr, 'gm');
        this.patterns = stack;

    }

};

module.exports = Config;