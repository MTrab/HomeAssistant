import DomainMap from "./../src/domain-map";
import assert from "assert";

describe('Registry API', () => {

  describe('Testing registry API', () => {
    it('It should support domain prefix and key value store', (done) => {
      let registry = new DomainMap();

      let domainA = 'myDomainA';
      let domainB = 'myDomainB';

      let testKeyA = 'myKey';
      let testValueA = 'myValue';
      
      let testKeyB = 'mySecondKey';
      let testValueB = 'mySecondValue';

      let defaultValue = 'myDefaultValue';

      // Test empty registry with default values
      if (registry.get(domainA, testKeyA) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainA, testKeyA, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));

      if (registry.get(domainB, testKeyA) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainB, testKeyA, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));


      // Test with values and default values
      registry.set(domainA, testKeyA, testValueA);
      registry.set(domainA, testKeyB, testValueB);

      if (registry.get(domainA, testKeyA) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyA, defaultValue) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB) !== testValueB)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB, defaultValue) !== testValueB)
        return done(new Error("Registry didn't return right test value"));

      // Test different domain with same key
      if (registry.get(domainB, testKeyA) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainB, testKeyA, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));


      // Test deleting same keys from different domain
      registry.delete(domainB, testKeyA);

      if (registry.get(domainA, testKeyA) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyA, defaultValue) !== testValueA)
        return done(new Error("Registry didn't return right test value"));


      // Test clearing different domain
      registry.clearDomain(domainB);

      if (registry.get(domainA, testKeyA) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyA, defaultValue) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB) !== testValueB)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB, defaultValue) !== testValueB)
        return done(new Error("Registry didn't return right test value"));


      // Test removing items
      registry.delete(domainA, testKeyA);

      if (registry.get(domainA, testKeyA) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainA, testKeyA, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));

      if (registry.get(domainA, testKeyB) !== testValueB)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB, defaultValue) !== testValueB)
        return done(new Error("Registry didn't return right test value"));

      registry.delete(domainA, testKeyB);

      if (registry.get(domainA, testKeyB) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainA, testKeyB, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));


      // Test re-enter same values
      registry.set(domainA, testKeyA, testValueA);
      registry.set(domainA, testKeyB, testValueB);

      if (registry.get(domainA, testKeyA) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyA, defaultValue) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB) !== testValueB)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB, defaultValue) !== testValueB)
        return done(new Error("Registry didn't return right test value"));


      // Test purging whole domain
      registry.clearDomain(domainA);

      if (registry.get(domainA, testKeyA) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainA, testKeyA, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));

      if (registry.get(domainA, testKeyB) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainA, testKeyB, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));

      done();
    })
  });

  describe('Testing domain operations', () => {
    it('It support getDomainKeysList and getDomain operations', (done) => {
      let registry = new DomainMap();

      const testValues = {
        domainA: 'testDomainA',
        domainB: 'testDomainB',
        testKeyA: 'testKeyA',
        testKeyB: 'testKeyB',
        testKeyC: 'testKeyC',
        testKeyD: 'testKeyD',
        testValueA: 'testValueA',
        testValueB: 'testValueB',
        testValueC: 'testValueC',
        testValueD: 'testValueD',
        defaultValueA: 'defaultValueA',
        defaultValueB: 'defaultValueB',
      }

      const probs = [
        {
          domain: testValues.domainA,
          key: testValues.testKeyA,
          value: testValues.testValueA
        },
        {
          domain: testValues.domainA,
          key: testValues.testKeyB,
          value: testValues.testValueB
        },
        {
          domain: testValues.domainA,
          key: testValues.testKeyC,
          value: testValues.testValueC
        },
        {
          domain: testValues.domainB,
          key: testValues.testKeyA,
          value: testValues.testValueA
        },
        {
          domain: testValues.domainB,
          key: testValues.testKeyB,
          value: testValues.testValueB
        },
        {
          domain: testValues.domainB,
          key: testValues.testKeyD,
          value: testValues.testValueD
        }
      ]

      // Test default values for empty registry
      if (registry.getDomainKeysList(testValues.domainA, testValues.defaultValueA) !== testValues.defaultValueA)
        return done(new Error("getDomainKeysList didn't return default value"));

      if (registry.getDomain(testValues.domainA, testValues.defaultValueB) !== testValues.defaultValueB)
        return done(new Error("getDomain didn't return default value"));

      let insertedKeys = {};

      probs.map(probItem => {
        registry.set(probItem.domain, probItem.key, probItem.value);
        if (!insertedKeys.hasOwnProperty(probItem.domain))
          insertedKeys[probItem.domain] = [];
        insertedKeys[probItem.domain].push(probItem.key);
      });

      // Test default values for non empty registry
      if (registry.getDomainKeysList(testValues.domainA, testValues.defaultValueA) === testValues.defaultValueA)
        return done(new Error("getDomainKeysList returns default value"));

      if (registry.getDomain(testValues.domainA, testValues.defaultValueB) === testValues.defaultValueB)
        return done(new Error("getDomain returns default value"));

      let errors = [];

      // Test key listing
      Object.keys(insertedKeys).forEach(function (domainName) {
        if (JSON.stringify(insertedKeys[domainName]) !== JSON.stringify(registry.getDomainKeysList(domainName)))
          errors.push(new Error("getDomainKeysList didn't return all expected keys"))
      });

      if (errors.length > 0)
        return done(errors[0]);

      // Test domain map
      Object.keys(insertedKeys).forEach(function (domainName) {
        registry.getDomain(domainName).forEach((testValue, testKey) => {
          if (insertedKeys[domainName].indexOf(testKey) < 0)
            errors.push(new Error("getDomain didn't return all expected keys"))
        });
      });

      if (errors.length > 0)
        return done(errors[0]);

      done();
    })
  });

  describe('Testing strictKeyMode', () => {
    it('It should support deep key comparision', (done) => {
      let registry = new DomainMap({strictKeyMode: false});

      let domainA = 'myDomainA';
      let domainB = 'myDomainB';

      let testKeyA = {'a': 'abc', 'b': 'def'};
      let testValueA = 'myValue';
      
      let testKeyB = {'c': 'ghi', 'b': 'jkl'};
      let testValueB = 'mySecondValue';

      // Copy of keys
      let testKeyACopy = Object.assign({}, testKeyA);
      let testKeyBCopy = Object.assign({}, testKeyB);

      let defaultValue = 'myDefaultValue';

      // Test empty registry with default values
      if (registry.get(domainA, testKeyA) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainA, testKeyA, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));

      if (registry.get(domainB, testKeyA) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainB, testKeyA, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));


      // Test with values and default values
      registry.set(domainA, testKeyA, testValueA);
      registry.set(domainA, testKeyB, testValueB);

      if (registry.get(domainA, testKeyA) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyA, defaultValue) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB) !== testValueB)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB, defaultValue) !== testValueB)
        return done(new Error("Registry didn't return right test value"));

      // Test deep comparision
      if (registry.get(domainA, testKeyACopy) !== testValueA)
        return done(new Error("Deep equal comparision fails"));

      if (registry.get(domainA, testKeyBCopy) !== testValueB)
        return done(new Error("Deep equal comparision fails"));

      // Test different domain with same key
      if (registry.get(domainB, testKeyA) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainB, testKeyA, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));


      // Test deleting same keys from different domain
      registry.delete(domainB, testKeyA);

      if (registry.get(domainA, testKeyA) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyA, defaultValue) !== testValueA)
        return done(new Error("Registry didn't return right test value"));


      // Test clearing different domain
      registry.clearDomain(domainB);

      if (registry.get(domainA, testKeyA) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyA, defaultValue) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB) !== testValueB)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB, defaultValue) !== testValueB)
        return done(new Error("Registry didn't return right test value"));


      // Test removing items
      registry.delete(domainA, testKeyA);

      if (registry.get(domainA, testKeyA) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainA, testKeyA, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));

      if (registry.get(domainA, testKeyB) !== testValueB)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB, defaultValue) !== testValueB)
        return done(new Error("Registry didn't return right test value"));

      registry.delete(domainA, testKeyB);

      if (registry.get(domainA, testKeyB) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainA, testKeyB, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));


      // Test re-enter same values
      registry.set(domainA, testKeyA, testValueA);
      registry.set(domainA, testKeyB, testValueB);

      if (registry.get(domainA, testKeyA) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyA, defaultValue) !== testValueA)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB) !== testValueB)
        return done(new Error("Registry didn't return right test value"));

      if (registry.get(domainA, testKeyB, defaultValue) !== testValueB)
        return done(new Error("Registry didn't return right test value"));


      // Test purging whole domain
      registry.clearDomain(domainA);

      if (registry.get(domainA, testKeyA) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainA, testKeyA, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));

      if (registry.get(domainA, testKeyB) !== false)
        return done(new Error("Registry returned content while it should be empty"));

      if (registry.get(domainA, testKeyB, defaultValue) !== defaultValue)
        return done(new Error("Registry didn't return default value for missing key"));

      done();
    })
  });

});
