# node-red-contrib-summariser
A Node-RED node that generates summaries from arrays of data

An array of data is passed in the `msg.payload` in the form:
```
[
  {"field1": <data>},
  {"field2": <data>},
  {"field3": <data>},
  ...
]
```

In the node's configuration, you can define a set of rules that apply to a field within the data table.
Each rule delivers its result on a separate output.

Rules available:

**Sum**

The `Sum` rule sums the numerical values in the given field across the arrays. It returns a single number in `msg.payload`.

**Count**

The `Count` rule counts the number of times the field occurs in the arrays.  It returns a single number in `msg.payload`.

**Mean**

The `Mean` rule calculates the mean of the numerical values in the given field across the arrays. It returns a single number in `msg.payload`.

**Group**

The `Group` rule calculates the frequency that every value in the given field occurs in the array. It returns an object where the values are the key, and the frequencies a returned as the value for the given key. This can be passed directly into a `split` node where the keys are emitted in `msg.topic` ready for the node-red-dashboard chart nodes.

**Join**

This rule joins all of the values in the given field across the array.
If given, the values are separated by string in the separator field in the configuration.
It returns a string in `msg.payload`.

**Extract**

This rule returns an array of all of the values for the given field across the array.
It returns an array in `msg.payload`.
