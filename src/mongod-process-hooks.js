'use strict';

const path = require('path');

module.exports = ({ mongodBinPath = '', logLevel = '20', timeout = 10000, mongodPort = 27017, mongodDBPath = '/data/db' } = {}) => {
    const processOptions = {
        logLevel,
        timeout,
        command: path.join(mongodBinPath, 'mongod'),
        successOutput: 'waiting for connections on port',
        errorOutput: 'exception',
        arguments: `--port ${mongodPort} --dbpath ${mongodDBPath}`
    };
    return require('mocha-process-hooks')(processOptions);
}