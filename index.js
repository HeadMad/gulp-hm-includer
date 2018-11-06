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

/**
 * Ключевая функция
 * @param {string} base Путь до папки с файлом
 * @return функия используемая в регулярном выражении
 */
function replacer(base) {

    
    return function (str) {
        let data;
        let path = str.replace(config.expr, config.path);
        
        // полный путь до подключаемого файла от дирректории текущего
        let fullPath = pather.join(base, path);

        /**
         * создать кэш файлов
         * с ключами из сырого пути
         */


        // если в буфере уже есть такой путь
        if (bufer.indexOf(fullPath) !== -1) {
            logWarning('This file was included before:', fullPath);
            return str;
        }

        // добавляем в буфер
        bufer.push(fullPath);

        try {
            // получаем данные подключаемого файла
            data = fs.readFileSync(fullPath, 'utf8');
        } catch (error) {
            logWarning("Can't open this file:", fullPath);
            return str;
        }

        // путь до дирректории подключённого файла
        let newBase = pather.parse(fullPath).dir;

        // рекурсивно проверяем, есть ли в файле подключения
        return recurReplace(data, newBase);
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
    if (!expr.test(data)) 
        return data;

    return data.replace(expr, replacer(base));
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