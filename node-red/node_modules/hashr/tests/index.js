var test = require('grape'),
    mockery = require('mockery'),
    pathToObjectUnderTest = '../';

mockery.registerAllowables([pathToObjectUnderTest]);

function resetMocks(){
    mockery.registerMock('crypto', {
        createHash: function(){
            return {
                update: function(){},
                digest: function(){}
            };
        }
    });
}

function getCleanTestObject(){
    delete require.cache[require.resolve(pathToObjectUnderTest)];
    mockery.enable({ useCleanCache: true, warnOnReplace: false });
    var objectUnderTest = require(pathToObjectUnderTest);
    mockery.disable();
    resetMocks();
    return objectUnderTest;
}

resetMocks();

test('simple default case', function(t){
    t.plan(1);

    var hashr = require('../');

    var result = hashr.hash('bacon');

    t.equal(result, '8abf15bef376e0e21f1f9e9c3d74483d5018f3d5', 'got correct SHA1 hash');

});

test('correct defaults', function(t){
    t.plan(4);

    var testValue = 'bacon',
        testResult = 'hashedBacon';

    mockery.registerMock('crypto', {
        createHash: function(algorithm){
            t.equal(algorithm, 'sha1', 'correctly defaults to sha1');

            return {
                update: function(value){
                    t.equal(value, testValue, 'sent correct value');
                },
                digest: function(encoding){
                    t.equal(encoding, 'hex', 'correctly defaults to hex');
                    return testResult;
                }
            };
        }
    });

    var hashr = getCleanTestObject();

    var result = hashr.hash(testValue);

    t.equal(result, testResult, 'got correct result');
});

test('correct lower cases', function(t){
    t.plan(2);

    var testValue = 'bacon',
        testAlgorithm = 'AlGoRiThM',
        testEncoding = 'EnCoDiNg';

    mockery.registerMock('crypto', {
        createHash: function(algorithm){
            t.equal(algorithm, testAlgorithm.toLowerCase(), 'correctly lowers algorithm');

            return {
                update: function(){},
                digest: function(encoding){
                    t.equal(encoding, testEncoding.toLowerCase(), 'correctly lowers encoding');
                }
            };
        }
    });

    var hashr = getCleanTestObject();

    hashr.hash(testValue, testAlgorithm, testEncoding);
});

test('correct detection of missing algorithm', function(t){
    var testValue = 'bacon',
        testEncodings = ['hex', 'binary', 'base64'],
        i;

    t.plan(testEncodings.length * 2);

    mockery.registerMock('crypto', {
        createHash: function(algorithm){
            t.equal(algorithm, 'sha1', 'correctly defaults to sha1');

            return {
                update: function(){},
                digest: function(encoding){
                    t.equal(encoding, testEncodings[i], 'correctly detected encoding ' + encoding);
                }
            };
        }
    });

    var hashr = getCleanTestObject();

    for (i = 0; i < testEncodings.length; i++) {
        hashr.hash(testValue, testEncodings[i]);
    }
});