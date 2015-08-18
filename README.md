# bOTL.js
bOTL Object Transformation Language v3

This is a javascript implementation of bOTL v3

You can read the [bOTL specification] (https://medium.com/@emlynoregan/botl-object-transformation-language-35ed297c6671).

Usage:
Just grab the file bOTL.js and use it like this:

    <script type="text/javascript" src="bOTL.js"></script>

    <script>
      var source = {"name": "Freddo"}
      var transform = "#$.name"
      var result = transform(source, transform)

      // result: "Freddo" 
    </script>

bOTL.js includes [Stefan Goessner's JSONPath implementation](https://code.google.com/p/jsonpath/), released under an MIT license.
