#hashr

Simple module for simplifying hashing of values

##Installation

    npm install hashr

##Usage

    var hashr = require('hasher');

    // Defaults to sha1 with hex output
    hashr.hash('bacon');    // 8abf15bef376e0e21f1f9e9c3d74483d5018f3d5

    // md5 with hex output
    hashr.hash('bacon', 'md5');    // 7813258ef8c6b632dde8cc80f6bda62f

    // md5 with base64 output
    hashr.hash('bacon', 'md5', 'base64');    // eBMljvjGtjLd6MyA9r2mLw==

    // default to sha1 and use binary output
    hashr.hash('bacon', 'binary');    // ¿\u0015¾óvàâ\u001f\u001f=tH=P\u0018óÕ