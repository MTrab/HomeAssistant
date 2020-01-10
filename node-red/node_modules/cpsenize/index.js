
function cpsenize(fn){
    return function(){
        var args = Array.prototype.slice.call(arguments),
            callback = args.pop(),
            context = this,
            result,
            error;

        try {
            result = fn.apply(context, args);
        }
        catch(exception){
            error = exception;
        }

        callback(error, result);
    };
}

module.exports = cpsenize;