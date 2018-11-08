'use strict';

const fs = require('fs');
const pather = require('path');
const through2 = require('through2').obj;
const config = require('./config.js');

// логер для вывода сообщений
const loger = require('hm-loger');
const logDanger  = loger('danger');
const logWarning = loger('warning');
const logSuccess = loger('success');
const logPrimary = loger('primary');
const logInfo =    loger('info');

// буфер путей до файлов, для избежания рекурсивного подключения
let bufer = [];



function replacer (base) {
    return function (string, before, indent, search, ...args) {

        console.log(arguments);

        let data;
        // строка начала вхождения
        let result = before;

        // получаем путь из подмаски пользователя
        let path = search.replace(config._expr, config.path);
        
        let fullPath = pather.join(base, path);
        
        // если в буфере уже есть такой путь
        if (bufer.indexOf(fullPath) !== -1) {
            logWarning('This file was included before:', fullPath);
            return string;
        }
        
        // добавляем в буфер
        bufer.push(fullPath);
        
        try {
            // получаем данные подключаемого файла
            data = fs.readFileSync(fullPath, 'utf8');
        } catch (error) {
            logWarning("Can't open this file:", fullPath);
            return string;
        }
        
        // путь до дирректории подключённого файла
        let newBase = pather.parse(fullPath).dir;
        
        if (indent !== undefined)
            result += data.replace(/\n/g, '$&' + indent);

        else
            result += data;
        
        // вставка после строки
        let i = args.length - 3;
        let after = args[i];

        // если есть вставка после строки
        if (after !== undefined) {
            result += after;
        }

        return recurReplace(result, newBase);
    }
}


/**
 * 
 * @param {string} data Данные для поиска подключений
 * @param {string} base Путь до дирректории подключенного файла
 */
function recurReplace (data, base) {
    // регулярное выражение по которому будем искать
    let expr = config.expr;

    // если совпадений нет
    if (!config._expr.test(data)) 
        return data;

    return data.replace(config.EXPR, replacer(base));
};


// Основная функция плагина
function Includer (params) {

    // проверяем переданные данные в поток
    return through2(function (file, enc, callback) {

        // если данных нет
        if (file.isNull()) {
            callback(null, file);
            return;
        }

        // если данные - поток
        if (file.isStream()) {
            logDanger('Streaming is not supported')
            return;
        }

        try {
            // импортируем данные в глобальный конфиг
            config.import(params);

            // преобразуем данные к строке
            let data = file.contents.toString();

            // проверяем наличие подключений в данных
            data = recurReplace(data, file.base);

            // сохраняем новые данные в файл
            file.contents = new Buffer(data);
            this.push(file);

            // очищаем буфер
            bufer = [];

        } catch (error) {
            logDanger(error)
        }

        // передаем файл в поток
        callback(null, file);
    });
};


module.exports = Includer;