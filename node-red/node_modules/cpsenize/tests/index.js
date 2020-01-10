var test = require('tape'),
    cpsenize = require('../');

function add(a, b, goBang){
    if(goBang){
        throw new Error('BANG!!!');
    }

    var result = a + b;

    if(this.c){
        result += this.c;
    }

    return result;
}

test('works', function(t){
    t.plan(2);

    var foo = cpsenize(add);

    foo(5, 6, function(error, result){
        t.notOk(error, 'no error');
        t.equal(result, 11, 'correct result');
    });
});

test('works with context', function(t){
    t.plan(2);

    var foo = {
            add: cpsenize(add),
            c: 10
        };

    foo.add(5, 6, function(error, result){
        t.notOk(error, 'no error');
        t.equal(result, 21, 'correct result');
    });
});

test('works with context and bind', function(t){
    t.plan(2);

    var foo = {
            add: cpsenize(add),
            c: 10
        };

    foo.add.bind({c:20})(5, 6, function(error, result){
        t.notOk(error, 'no error');
        t.equal(result, 31, 'correct result');
    });
});

test('errors', function(t){
    t.plan(3);

    var foo = cpsenize(add);

    foo(5, 6, true, function(error, result){
        t.ok(error instanceof Error, 'has error');
        t.equal(error.message, 'BANG!!!', 'correct error');
        t.notOk(result, 'no result');
    });
});