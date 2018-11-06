module.exports = {
    _pattern: /\{\{\s*(\S+)\s*\}\}/g,

    import: function (params) {
        for (let key in params) {
            if (['pattern'].indexOf(key) === -1)
                continue;

            this[key] = params[key];
        }

    },

    getPattern: function () { return this.userPattern || this._pattern; },

    set pattern(value) {
        // если регулярное выражение
        if (value instanceof RegExp) {
            this.userPattern = value;
            return;
        }

        // если не строка
        if (typeof value !== 'string') {
            logDanger('Invalid format of property: pattern');
            return;
        }

        // если в паттерне нет ключевого слова
        if (value.indexOf('%PATH%') === -1)
            return;

        // переводим строку в регулярное выражение
        let expr = value.replace(/\.|\^|\$|\*|\+|\?|\(|\)|\[|\]|\{|\}|\\|\|/g, '\\$&')
            .replace(/\s*PATH\s*/g, '\\s*(\\S+)\\s*');

        this.userPattern = new RegExp(expr, 'g');

    },

};