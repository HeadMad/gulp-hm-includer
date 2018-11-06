const fs = require('fs');
const loger = require('hm-loger');
const logDanger = loger('danger');

const configFields = ['pattern'];

const Config = {

    import: function (params) {
        for (let key in params) {
            if (configFields.indexOf(key) === -1)
                continue;

            this[key] = params[key];
        }

    },

    set pattern(value) {

        let type = Object.prototype.toString.call(value).slice(8, -1);

        // если передана строка
        if (type === 'String') {
            try {
                let pattern = require('./expressions/' + value);
                this.expr = pattern.expr;
                this.path = pattern.path;
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

        // если регулярное выражение
        if (value.expr instanceof RegExp) {
            this.expr = value.expr;
            this.path = value.path;
            return;
        }

        // если не строка
        if (typeof value.expr !== 'string') {
            logDanger('Invalid format of property:', 'pattern.expr');
            return;
        }

        // если не строка
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
                             .replace(path, '(.+)');

        this.expr = new RegExp(expr, 'g');
        this.path = '$1';

    },

};

module.exports = Config;