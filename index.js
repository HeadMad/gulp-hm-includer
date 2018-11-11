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
 * 
 * @param {string} data Данные для поиска подключений
 * @param {string} dir Путь до дирректории подключенного файла
 */
function recurReplace( data, dir ) {

    let dtd = data.replace(config.expression, firsRoundReplace( dir ));
    return dtd;
};

/**
 * Первый круг замены:
 * построчный разбор
 * для передачи отступов строк
 * @param {string} dir путь до папки подключаемого файла
 */
function firsRoundReplace( dir ) {
    
    return function ( string, indent, ...search ) {
        let result = string;
        let inputs = search.slice(0, -2);
        
        console.log(string);
        logInfo('|' + indent + '|');

        inputs.forEach(function (input, i) {
            if (input === undefined)
                return;

            let pattern = config.patterns[i];

            let path = input.replace(pattern.exprSimple, pattern.path);
            let fullPath = pather.join(dir, path);

            // если в буфере уже есть такой путь
            if (bufer.indexOf(fullPath) !== -1) {
                logWarning('This file was included before:', fullPath);
                return result;
            }

            result = result.replace(pattern.expr, secondRoundReplace(fullPath, indent, pattern.wrap));
        });

        return result;
    }
}

/**
 * второй круг замены:
 * получение путей из вхождений
 * обработка данных из подключаемых файлов
 * @param {string} dir путь до папки фала из которого идёт подключение
 * @param {string} indent отступы в начале строки
 */
function secondRoundReplace( path, indent, wrap ) {
    
    return function ( string ) {

        // добавляем в буфер
        bufer.push( path )
        let result;
        try {
            // получаем данные подключаемого файла
            result = fs.readFileSync( path, 'utf8' );

            // если есть внутренние отступы
            if ( wrap ) {
                result = wrap.replace(/([^\n\S]+)?\{\{\}\}/, wrapReplace( result ) );
                
            }
            
            // отступы строк
            if (indent !== undefined)
                result = result.replace(/\n/g, '$&' + indent);


        } catch (error) {
            logWarning( "Can't open this file:", path );
            return string;
        }
        
        // путь до дирректории подключённого файла
        let newBase = pather.parse( path ).dir;

        return recurReplace( result, newBase );
    }
    
}

function wrapReplace(inner) {
    return function (_, indent) {
        if (indent) {
            inner = indent + inner.replace(/\n/g, '$&' + indent);
        }

        return inner;
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