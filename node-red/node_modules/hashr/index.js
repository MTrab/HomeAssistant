var crypto = require('crypto'),
    encodings = ['hex', 'binary', 'base64'];

function hash(value, algorithm, encoding){
    if(encoding){
        encoding = encoding.toLowerCase();
    }

    if(algorithm){
        algorithm = algorithm.toLowerCase();

        if(!encoding && ~encodings.indexOf(algorithm)){
            encoding = algorithm;
            algorithm = null;
        }
    }

    var createdHash = crypto.createHash(algorithm || 'sha1');
    createdHash.update(value, 'utf8');

    return createdHash.digest(encoding || 'hex');
}

module.exports = {
    hash: hash
};