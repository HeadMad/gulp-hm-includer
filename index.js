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

    // если совпадений нет
    if (!config.expr.test( data ))
        return data;

    let dtd = data.replace(config.gmExpr, firsRoundReplace( dir ));
    return dtd;
};

/**
 * Первый круг замены:
 * построчный разбор
 * для передачи отступов строк
 * @param {string} dir путь до папки подключаемого файла
 */
function firsRoundReplace( dir ) {
    return function ( _, string, indent ) {
        let result;

        result = string.replace( config.gExpr, secondRoundReplace( dir, indent ) );

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
function secondRoundReplace( dir, indent ) {
    
    return function ( string ) {
        // Путь до файла
        let path = string.replace( config.expr, config.path );
        let fullPath = pather.join( dir, path );
        
        
        // если в буфере уже есть такой путь
        if ( bufer.indexOf(fullPath) !== -1 ) {
            logWarning( 'This file was included before:', fullPath );
            return string;
        }
        
        // добавляем в буфер
        bufer.push( fullPath )
        let result;
        try {
            // получаем данные подключаемого файла
            result = fs.readFileSync( fullPath, 'utf8' );

            // если есть внутренние отступы
            if ( config.indent )
                result = config.indent + result.replace(/\n/g, '$&' + config.indent);

            if ( config.before )
                result = config.before + result;

            if ( config.after )
                result += config.after;
            
            // отступы строк
            if (indent !== undefined)
                result = result.replace(/\n/g, '$&' + indent);

        } catch (error) {
            logWarning( "Can't open this file:", fullPath );
            return string;
        }
        
        // путь до дирректории подключённого файла
        let newBase = pather.parse( fullPath ).dir;

        return recurReplace( result, newBase );
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