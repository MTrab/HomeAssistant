# domain-map
Provides domain prefixed ES6 Maps. Can be used as registry for other components.

### Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save domain-map

### How to use?

Normal usage with ES2015 modules:

```js
import DomainMap from 'domain-map'
let registry = new DomainMap();

// Set value for key with domain prefix
registry.set('myDomain', 'someKey', 'value1');
registry.set('myDomain', 'otherKey', 'value2');

// Get value for domain key
registry.get('myDomain', 'someKey');
// Returns 'value1'

// You can provide default value, which will be used if key doesn't exists
registry.get('myDomain', 'randomKey', false);
// Returns 'false'

// Get list of keys
registry.getDomainKeysList('myDomain');
// Returns ["someKey", "otherKey"]

// Or whole domain
let items = registry.getDomain('myDomain');
items.forEach((key, value) => {
  // Iterate
});

// Clear whole domain
registry.clearDomain('myDomain');

// Since key values are maps, you can actually save anything:
registry.set('properties', 'objectAsValue', {abc: false});
registry.set('properties', 'exampleFunction', (value) => { return value + 1; });

```

In some cases you wan't to store data for key which is actually an object.
Normal ES6 Map object will return value for object only if key is exactly the same object you used when storing data:

```js
// Normal maps
let map = new Map();

let myObjectKey = {entityId: 1};
let mySecondKey = {entityId: 1};

map.set(myObjectKey, {name: "Alice"});
map.get(myObjectKey);
// Will return {name: "Alice"}

map.get(mySecondKey);
// Will return null, since key objects are not same

```

Domain map allows you to use "deep object key comparison". Two objects are same if their values equals:

```js
import DomainMap from 'domain-map'

let registry = new DomainMap({strictKeyMode: false});

let myObjectKey = {entityId: 1};
let mySecondKey = {entityId: 1};

registry.set('myDomain', myObjectKey, {name: 'Alice'});
registry.get('myDomain', mySecondKey, false);
// Will return {name: 'Alice'}

```


[npm]: https://www.npmjs.org/package/domain-map


