const bOTL = require("../bOTL");

const objects = require("./testsData").sources;
const transforms = require("./testsData").transforms;

const transformEqual = (source, transform, result) => {
  let transformed = bOTL.transform(source, transform);
  return expect(transformed).toEqual(result);
};

describe("for bOTL.transform()", () => {
  describe("root", () => {
    it("supports root selector", () => {
      return transformEqual(objects["freddo dict"], transforms["root"], objects["freddo string"]);
    });
  });

  describe("local", () => {
    it("supports local selector", () => {
      return transformEqual(objects["freddo dict"], transforms["local"], objects["freddo string"]);
    });

    it("supports local selector in list", () => {
      return transformEqual(objects["freddo dict"], transforms["list"], objects["freddo in list"]);
    });
  });

  describe("transformations", () => {
    it("supports plain object transformation (sayings)", () => {
      return transformEqual(objects["freddo dict"], transforms["object1"], objects["object1"]);
    });

    it("supports complex object transformation (synopsis)", () => {
      return transformEqual(objects["source1"], transforms["synopsis"], objects["synopsis"]);
    });

    it("supports plain object transformation (websites)", () => {
      return transformEqual(objects["source1"], transforms["basics"], objects["basics"]);
    });
  });

  describe("section", () => {
    it("supports JSONPath-style selection - plain", () => {
      return transformEqual(objects["source1"], transforms["sections1"], objects["source1"]);
    });

    it("supports JSONPath-style selection - with path", () => {
      return transformEqual(objects["source1"], transforms["sections2"], objects["races list"]);
    });

    it("supports JSONPath-style selection - with path and null transform", () => {
      return transformEqual(objects["source1"], transforms["sections3"], objects["none string"]);
    });

    it("supports JSONPath-style selection - with path and transform", () => {
      return transformEqual(objects["source1"], transforms["sections4"], objects["races objs"]);
    });

    it("supports JSONPath-style selection - with path and list transform", () => {
      return transformEqual(objects["source1"], transforms["list2"], objects["list2"]);
    });
  });

  describe("brief (inline)", () => {
    it("supports inline root selection - plain", () => {
      return transformEqual(objects["source1"], transforms["brief1"], objects["source1"]);
    });

    it("supports inline root selection - path in list", () => {
      return transformEqual(objects["source1"], transforms["brief2"], objects["races list"]);
    });

    it("supports inline root selection - path in list with transform", () => {
      return transformEqual(objects["source1"], transforms["brief4"], objects["races objs"]);
    });
  });

  describe("scope", () => {
    it("supports scoping - with transform 1", () => {
      return transformEqual(objects["source1"], transforms["scope"], objects["scope"]);
    });

    it("supports scoping - with transform and nulltransform", () => {
      return transformEqual(objects["source1"], transforms["scope2"], objects["scope2"]);
    });

    it("supports scoping - with transform 2", () => {
      return transformEqual(objects["source1"], transforms["scope3"], objects["scope3"]);
    });
  });

  describe("context", () => {
    it("supports list contexts - all items in the list", () => {
      return transformEqual(objects["source1"], transforms["context1"], objects["context1"]);
    });

    it("supports single contexts - only the first item / null", () => {
      return transformEqual(objects["source1"], transforms["context2"], objects["context2"]);
    });

    it("supports attribute contexts - hide nulls", () => {
      return transformEqual(objects["source1"], transforms["context3"], objects["context3"]);
    });
  });

  describe("object section", () => {
    it("has nested dictionaries still treated as sections", () => {
      return transformEqual(objects["source1"], transforms["ObjectSection"], objects["ObjectSection"]);
    });
  });

  describe("literal section", () => {
    it("is not treated as a transform at all", () => {
      return transformEqual(objects["source1"], transforms["LiteralSection"], objects["LiteralSection"]);
    });
  });

  describe("nulls", () => {
    it("keeps nulls", () => {
      return transformEqual(objects["source1"], transforms["KeepNulls"], objects["KeepNulls"]);
    });

    it("doesn't keep nulls", () => {
      return transformEqual(objects["source1"], transforms["DontKeepNulls"], objects["DontKeepNulls"]);
    });
  });

  describe("misc", () => {
    it("returns null if no parameters passed to function", () => {
      return transformEqual(null, null, null);
    });
  });
});
