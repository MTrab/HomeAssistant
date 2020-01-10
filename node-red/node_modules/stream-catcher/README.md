# stream-catcher

a streaming wrapper around lru-cache

# usage

```javascript

var streamCache = new StreamCatcher({lru-cache options});

// ask for the data at `'key'` to be streamed to `writeStream`
streamCache.write('key', writeStream, notCachedCallback);

// ask to stream data to `'key'` from `readStream`
streamCache.read('key', readStream);


```

# example

stream files from disk to a http response, cached for next time.

```javascript

var streamCache = new StreamCatcher({
    max: 1024 * 100, // 100kb
    length: function(n){ 
        return n.length;
    }
});

var filePath = './foo/bar.txt';

function getFile(filePath, response){

    streamCache.write(filePath, response, function(){
        // function called if the cache is empty.
        // If so, read into the cache
        streamCache.read(filePath, fs.createReadStream(filePath));
    });

}

// First call: Nms
getFile(filePath, response);

// Next call: <Nms
getFile(filePath, response);

// Time passes, file falls out of cache...

// Next call ~ Nms
getFile(filePath, response);

```