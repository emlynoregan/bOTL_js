# bOTL.js
bOTL Object Transformation Language v3
_It's Mustache for JSON_

This is a JavaScript implementation of bOTL v3.

Get started by reading the [bOTL specification](https://medium.com/@emlynoregan/botl-object-transformation-language-35ed297c6671) at Medium.

## Usage
### Node.js
```javascript
const botl = require("botl");

let source = {"name": "Freddo"};
let transform = "#$.name";

let result = botl.transform(source, transform);
// result: "Freddo" 
```

### Web
Just grab the file bOTL.js and use it like this:

```javascript
<script type="text/javascript" src="bOTL.js"></script>

<script>
  let source = {"name": "Freddo"};
  let transform = "#$.name";

  let result = transform(source, transform);
  // result: "Freddo"
</script>
```

You can also use a package manager like [yarn](https://yarnpkg.com/), [npm](https://www.npmjs.com) or [bower](https://bower.io/) (deprecated).

bOTL.js includes [Stefan Goessner's JSONPath implementation](https://code.google.com/p/jsonpath/), released under an MIT license.
