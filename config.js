const loger = require('hm-loger');
const logDanger = loger('danger');

const configFields = ['pattern'];

function typeOf ( arg ) {
    return Object.prototype.toString.call(arg).slice(8, -1);
}

function writeProp (from, to, ...props) {
    props.forEach(function (prop) {
        if ( from[prop] === undefined ) {
            return;
        }
        to[prop] = from[prop];
    });
}

const Config = {

    import: function (params) {
        for (let key in params) {
            if (configFields.indexOf(key) === -1)
                continue;

            this[key] = params[key];
        }

    },

    writeExpression ( expr ) {
        this.gmExpr = new RegExp( '^\\n?(([^\\n\\S]*).*?' + expr.source + '.*)$', 'gm' );
        this.expr = new RegExp( expr.source );
        this.gExpr = expr;
    },

    set pattern(value) {

        let type = typeOf( value );

        // если передана строка
        if (type === 'String') {
            try {
                let pattern = require('./patterns/' + value);
                this.writeExpression(pattern.expr, pattern.path);
                writeProp( pattern, this, 'path', 'wrap' );
            } catch (error) {
                logDanger('a non-existent pattern:', value);
            }
            return;
        }
        
        
        if (type !== 'Object')
        return;
        
        // если не установлен паттерн или значение пути
        if (!value.expr || !value.path)
        return;

        writeProp( value, this, 'wrap' );

        
        // если регулярное выражение
        if (value.expr instanceof RegExp) {
            this.writeExpression(value.expr);
            writeProp( value, this, 'path' );
            return;
        }
        
        // если не строка
        if (typeof value.expr !== 'string') {
            logDanger('Invalid format of property:', 'pattern.expr');
            return;
        }

        // если path не строка
        if (typeof value.path !== 'string') {
            logDanger('Invalid format of property:', 'pattern.path');
            return;
        }
        
        // если в паттерне нет ключевого слова
        if (value.expr.indexOf(value.path) === -1) {
            logDanger('pattern.path must be a substring of the pattern.expr');
            return;
        }

        // хеш для замены в выражении
        let path = Date.now();

        // переводим строку в регулярное выражение
        let expr = value.expr.replace(value.path, path)
                             .replace(/\.|\^|\$|\*|\+|\?|\(|\)|\[|\]|\{|\}|\\|\|/g, '\\$&')
                             .replace(path, '(.+?)');

        this.writeExpression(new RegExp(expr, 'g'));

        writeProp( {path: '$1'}, this, 'path');

    },

};

module.exports = Config;