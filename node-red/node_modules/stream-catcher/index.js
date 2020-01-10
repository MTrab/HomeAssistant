var cache = require('lru-cache'),
    through = require('through'),
    concat = require('concat-stream');

function StreamCatcher(options){
    this._pendingWriteStreams = {};
    this._reading = {};
    this._cache = cache(options);
}
StreamCatcher.prototype.read = function(key, readStream){
    var catcher = this,
        concatStream = concat(function(data){
            catcher._reading[key]--;
            if(catcher._reading[key] === 0){
                catcher._cache.set(key, data);
            }
        });

    this._cache.del(key);

    if(!this._reading[key]){
        this._reading[key] = 0;
    }

    this._reading[key]++;

    readStream.pipe(concatStream);

    var cacheThrough = through(function(){
        var pendingWriteStreams = catcher._pendingWriteStreams[key];

        while(pendingWriteStreams && pendingWriteStreams.length){
            var writeStream = pendingWriteStreams.pop();
            if(readStream.objectMode){
                concatStream.getBody().forEach(function(chunk){
                    writeStream.write(chunk);
                });
            }else{
                writeStream.write(concatStream.getBody());
            }

            readStream.pipe(writeStream);
        }
    });

    readStream.pipe(cacheThrough);
};
StreamCatcher.prototype.write = function(key, writeStream, needsStream){
    var data = this._cache.get(key);

    if(data != null){
        if(Array.isArray(data)){
            data = '';
        }
        writeStream.write(data);
        writeStream.end();
        return;
    }

    if(!this._reading[key]){
        if(needsStream){
            needsStream(key);
        }
    }

    if(!this._pendingWriteStreams[key]){
        this._pendingWriteStreams[key] = [];
    }

    this._pendingWriteStreams[key].push(writeStream);
};
StreamCatcher.prototype.has = function(key){
    return this._cache.has(key) || !!this._reading[key];
};
StreamCatcher.prototype.del = function(key){
    return this._cache.del(key);
};
StreamCatcher.prototype.reset = function(key){
    return this._cache.reset(key);
};

module.exports = StreamCatcher;