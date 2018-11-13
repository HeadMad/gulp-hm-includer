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
 * Рекурсивная обработка данных из подключаемых файлов
 * @param {string} data Данные для поиска подключений
 * @param {string} dir Путь до дирректории подключенного файла
 */
function recurReplace( data, dir ) {
    
    // если нечего искать
    if (!config.expression) {
        return data;
    }

    return data.replace(config.expression, firsRoundReplace( dir ));
};

/**
 * Первый круг замены:
 * построчный разбор
 * для передачи отступов строк
 * @param {string} dir путь до папки подключаемого файла
 */
function firsRoundReplace( dir ) {
    
    return function ( string, ...args ) {

        let result = string;
        let inputs = args.slice(0, -2);

        
        inputs.some( (input, i) => {
            
            // Пропускаем итерацию
            if (input === undefined) {
                return false;
            }
            
            // получаем паттерн вхождения
            let pattern = config.patterns[i];
            
            // полный путь до файла
            let path = input.replace(pattern.expr, pattern.path);
            let fullPath = pather.join(dir, path);
            
            // если такой путь уже был подключен
            if (bufer.indexOf(fullPath) !== -1) {
                logWarning('This file was included before:', "'" + fullPath + "'");
                return false;
            }
            
            // добавляем путь в буфер
            bufer.push(fullPath);
            
            // Вычисляем индентацию
            let exprSource = '^\\n?([^\\n\\S]+)?.*?' + input.replace(/\.|\^|\$|\*|\+|\?|\(|\)|\[|\]|\{|\}|\\|\|/g, '\\$&');
            let expr = new RegExp(exprSource, 'm');
            let data = args[args.length - 1];
            let indent = expr.exec(data)[1];
            
            // Получаем данные файла
            result = getFileData (fullPath, indent, pattern);
            return true;
        });

        if (result === false) {
            return string;
        }

        return result;
    }
}

function getFileData (path, indent, pattern) {

    let result;

    try {
        // получаем данные подключаемого файла
        result = fs.readFileSync(path, 'utf8');
    } catch (e) {
        // если такого файла не существует
        try {
            fs.lstatSync(path).isFile();
            return '';
        } catch (e) {
            logWarning("Can't open this file:", "'" + path + "'");
            return false;
        }
    }

    // если есть внутренние отступы
    if (pattern.wrap) {
        result = pattern.wrap.replace( /([^\n\S]+)?\{\{\}\}/, wrapReplace( result ));
    }

    // отступы строк
    if (indent) {
        result = result.replace(/\n/g, '\n' + indent);
    }


    // путь до дирректории подключённого файла
    let newBase = pather.parse(path).dir;

    return recurReplace(result, newBase);
}

/**
 * Обработчик обёртки, добавляющий индентацию
 * @param {string} data содержиме файла для обёртки
 */
function wrapReplace ( data ) {

    return function ( _, indent) {
        if (indent !== undefined) {
            data = indent + data.replace(/\n/g, '\n' + indent);
        }
        return data;
    }
}

// Основная функция плагина
function Includer ( params ) {

    // проверяем переданные данные в поток
    return through2(function ( file, enc, callback ) {

        // если данных нет
        if (file.isNull()) {
            callback( null, file );
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

            // добавляем файл в буфер
            bufer.push(file.history[0]);

            // проверяем наличие подключений в данных
            data = recurReplace( data, file.base );

            // сохраняем новые данные в файл
            file.contents = new Buffer( data );
            this.push(file);

            // очищаем буфер
            bufer = [];

        } catch ( error ) {
            logDanger( error )
        }

        // передаем файл в поток
        callback( null, file );
    });
};


module.exports = Includer;