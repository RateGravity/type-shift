# Type Shift
Evolutionary Type Converters for input validation and transformation

## Installation
`npm install --save type-shift`

`yarn add type-shift`

## What is Type Shift
Type Shift is a tool for building type converters and validators for schemas that will evolve over time. With Type Shift you declare a converter that "pulls" various historical input schemas into the current schema.

### Why should I use Type Shift instead of X
Type Shift is explicitly designed as single directional input validators / converters for schemas that change over time. This is very useful if you control both the reader and the writer of data. A good example is internal apis, or validating data stored in untyped storage such as IndexedDB. In these cases even though you are both the producer and consumer of the data you cannot rely on that data being valid due to changes in your application over time or other people or processes deciding to change your data on you. It is often a lot of effort to use explicit schema versioning in these situations.

With Type Shift you define a converter that knows how to infer new schema fields from previous versions of the schema, these are then used to pull data into the new format so your application only needs to think about it's newest schema version. Type Shift can also be used as an adaptor to transform one schema into another, however for anything other than trivial cases it's often easier to define these transformations with code after type checking an input.

Type Shift is intentionally focused on uni-directional conversions. This makes it easy to define a series of transformations without needing to define a way to "un-transform" data. Some use cases would benefit from being able to convert data from and to the same schema in which case Type Shift may not be the right tool.

## Converter Function Signature
A Converter is a function with the following signature:
```ts
<Result, Input>(input: Input, path: Array<string | number>, entity: unknown) => Result;
```
- `input` The value from the input that should be validated or converter. Most converters take an Input of `unknown`.
- `path` An array of string and number segments that made up the path to get to this point. Useful for error reporting and relative path traversal.
- `entity` The root entity that the conversion was started on. Useful for inferring new property values from old properties.

### Combining Converters
Converters have 3 combination methods included with them.
- `.pipe` given another converter function creates a converter that chains the 2 converters in sequence.
- `.or` given another converter tries first this converter than the other converter, only returning an error if both fail.
- `.default` given another converter function creates a converter that uses the default converter if an input is undefined. This is useful for defining default inputs: eg. `t.string.default(() => '')` as well as sourcing data from other places in the tree `t.string.default(t.forPath([t.ParentPath, 'other']))`. The result of the default value is passed to the converter that `.default` was called on ensuring that the value is correctly converted.

### Creating A Converter
Usually you'll create a custom converter by chaining with the `pipe`, `default`, or `or` methods. However if you whish to create your own converter you can pass a function to the `createConverter` function.

## Built-in Converters

### Basic Converters
These convert the basic types with some coercion.
- `number` - allows numbers as strings.
- `string` - stringifies number and boolean values.
- `boolean` - allows string values of true and false.
- `unknown` - allows everything
- `never` - allows nothing
- `null` - allows null
- `undefined` - allows undefined
- `literal(<value>)` - create a new converter that expects a value === to the given value.

### Containers
These converters match their elements against a given converter.
- `array(<converter function>)` - An array, applies the converter function to all elements and returns the resulting array.
- `record(<converter function>)` - An object, applies the converter function to all values and returns the resulting object.

### Objects
- `strict(<{ [key]: converter function }>)` - Given an object of keys to converters creates a converter that matches input keys with the declared converters and returns the resulting object. Only declared keys are returned.
- `shape(<{ [key]: converter function }>)` - Same as strict but any keys present on the input that are not declared are also returned.
- `partial(<strict or shape>)` - Given either a strict or shape converter makes every field optional, maintains strictness.
- `optional(<converter function>)` - Create a converter function that passes undefined input around the inner converter, useful for marking optional fields in objects.

### Paths
- `forPath(<path array>, ?<converter function>)` - Navigates to the given path (either relative or from root),returning the value that is there. Optionally apply a converter function to the value before it is returned.
- `sub(<converter function>)` - Run the given converter function as though this was the root of the path. Allows root based navigation via `forPath` to work if a converter is being inserted in various places in a tree.

### Unions
- `oneOf(<option[]>)` - Given an array of option values returns the value if it === the input value.
-  `taggedUnion(<tagField>, <{ [tag]: converter function }>)` - Pulls the value of the property specified by the tag field off of the input and uses it to find the correct converter function. Tagged unions should be used instead of the `.or` combination for complex objects as we can report on errors better.
- `select(<converter function>)` - Given a converter function that takes a value and returns a converter function create a converter that runs the returned converter function. Useful for when runtime inspection of values beyond a tagged union is needed.

### Other
- `compose(<converter function[]>, <combiner>)` - given one or more converters apply them and pass all the results to a combiner function that determines the result of the converter.
- `convert(<converter function>)` - given a converter function return a function that takes only one value and converts it. Allows converter functions to be used in situations like `map` where the second and third arguments should not be passed to the converter function.