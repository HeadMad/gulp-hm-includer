const fs = require('fs');

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
                let pattern = require('./expressions' + value);
                this.expr = pattern.expr;
                this.path = path;
            } catch (error) {
                logDanger('a non-existent pattern:', value);
            }
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

        let path = Date.now();
        let flag = value.flag || 'g';

        // переводим строку в регулярное выражение
        let expr = value.expr.replace(value.path, path)
                             .replace(/\.|\^|\$|\*|\+|\?|\(|\)|\[|\]|\{|\}|\\|\|/g, '\\$&')
                             .replace(new RegExp(path), '(\\S+)');

        this.expr = new RegExp(expr, flag);
        this.path = '$1';

    },

};

module.exports = Config;