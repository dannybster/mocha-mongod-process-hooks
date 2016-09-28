console.log(process.version);

const ps = require('ps-node');
const should = require('should');

const customMongodQuery = {
    command: process.env.MONGOD_PATH + '/mongod',
    arguments: process.env.MONGOD_ARGUMENTS,
    psargs: 'aux'
};

const defaultMongodQuery = {
    command: /mongod/,
    psargs: 'aux'
};

function testProcessIsRunning(psQuery) {
    return function isProcessRunning(done) {
        ps.lookup(psQuery, (err, result) => {
            should.not.exist(err);
            result.length.should.eql(1);
            done();
        });
    };
}

function testProcessIsNotRunning(psQuery) {
    return function isProcessNotRunning(done) {
        ps.lookup(psQuery, (err, result) => {
            should.not.exist(err);
            result.length.should.eql(0);
            done();
        });
    }
}

function runTestsWithMongodOptions(description, mongodOptions, psQuery) {
    const sut = require('../src/mongod-process-hooks')(mongodOptions);
    sut.debugLog(`Query: ${JSON.stringify(psQuery)}`);
    sut.debugLog(`MongoDB options: ${JSON.stringify(mongodOptions)}`);

    describe(`=== The process hooks ${description}. ===`, function () {
        describe('Before requiring the process hooks', function () {
            it('the process should not be running.', testProcessIsNotRunning(psQuery));
        });

        describe('After requiring the process hooks with all the options', function () {
            // Add the after each here so that it runs after the hooks inside
            // require('../src/process-hooks')(program).start() that way we can
            // be sure that we are testing that the process is still running 
            // after the hooks under test.
            // In summary mocha before hooks are FIFO and mocha after hooks are
            // FILO so adding this as the first means it will run last. Phew!
            afterEach('the process should be running.', testProcessIsRunning(psQuery));

            sut.start();
            it('the process should be running.', testProcessIsRunning(psQuery));
        });

        describe('After all the tests have run', function () {
            it('the process should not be running.', testProcessIsNotRunning(psQuery));
        });
    });
};

const customOptions = {
    mongodBinPath: process.env.MONGOD_PATH,
    mongodPort: process.env.MONGOD_PORT,
    mongodDBPath: process.env.MONGOD_DATA_PATH,
    timeout: process.env.PROGRAM_TIMEOUT,
    logLevel: process.env.LOG_LEVEL
};

const defaultOptions = {
    timeout: process.env.PROGRAM_TIMEOUT,
    logLevel: process.env.LOG_LEVEL
};

runTestsWithMongodOptions('with custom options', customOptions, customMongodQuery);
if (!process.env.DEFAULT_MONGOD_IS_RUNNING) {
    runTestsWithMongodOptions('with default options', defaultOptions, defaultMongodQuery);
}
