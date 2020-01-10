var test = require('tape'),
    fs = require('fs'),
    ReadableStream = require('stream').Readable,
    concatStream = require('concat-stream'),
    StreamCatcher = require('../'),
    testFilePath = __dirname + '/test.txt';

test('stream to target', function(t){
    t.plan(1);

    var catcher = new StreamCatcher({
        max: 1024 * 100,
        length: function(n){ 
            return n.length;
        }
    });

    var expected = fs.readFileSync(testFilePath);

    catcher.write(
        'foo', 
        concatStream(function(data){
            t.equal(data.toString(), expected.toString());
        }),
        function(key){
            catcher.read(key, fs.createReadStream(testFilePath));
        }
    ); 
});

test('stream to target', function(t){
    t.plan(1);

    var catcher = new StreamCatcher({
        max: 1024 * 100,
        length: function(n){ 
            return n.length;
        }
    });

    var expected = fs.readFileSync(testFilePath);

    catcher.write(
        testFilePath, 
        concatStream(function(data){
            t.equal(data.toString(), expected.toString());
        })
    ); 

    catcher.read(testFilePath, fs.createReadStream(testFilePath));
});

test('stream to target', function(t){
    t.plan(1);

    var catcher = new StreamCatcher({
        max: 1024 * 100,
        length: function(n){ 
            return n.length;
        }
    });

    var expected = fs.readFileSync(testFilePath);
    
    catcher.read(testFilePath, fs.createReadStream(testFilePath));

    catcher.write(
        testFilePath, 
        concatStream(function(data){
            t.equal(data.toString(), expected.toString());
        })
    ); 

});

test('totes', function(t){
    var hits = 5;
    t.plan(hits);

    var catcher = new StreamCatcher({
        max: 1024 * 100,
        length: function(n){ 
            return n.length;
        }
    });

    var expected = fs.readFileSync(testFilePath);

    var x = hits;
    while(x--){
        catcher.write(
            'foo', 
            concatStream(function(data){
                t.equal(data.toString(), expected.toString());
            }),
            function(key){
                catcher.read(key, fs.createReadStream(testFilePath));
            }
        ); 
    }
});

test('object mode', function(t){
    t.plan(1);

    var catcher = new StreamCatcher({
        max: 2,
        length: function(n){ 
            return 1;
        }
    });

    var expected = fs.readFileSync(testFilePath);

    var readable = ReadableStream({objectMode: true});

    var x = 0;
    readable._read = function(){
        if(x++ >= 4){
            this.push(null);
            return;
        }

        var r = this;
        setTimeout(function(){
            r.push({});
        },100);
    };


    catcher.write(
        'foo', 
        concatStream({encoding: 'object'}, function(data){
            t.equal(data.length, 4);
        }),
        function(key){
            catcher.read(key, readable);
        }
    ); 
});
