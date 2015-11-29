"use strict";

var describedClass = require("../../../lib/sentient/runtime/metadataExtractor");

describe("MetadataExtractor", function () {
  it("extracts metadata from the given program", function () {
    var metadata = describedClass.extract('\n\
      c Sentient Machine Code, Version 1.0 \n\
      c {                                  \n\
      c   "foo": "bar",                    \n\
      c   "baz": ["qux"]                   \n\
      c }                                  \n\
      p cnf 1 1                            \n\
      1 0                                  \n\
    ');

    expect(metadata).toEqual({
      "foo": "bar",
      "baz": ["qux"]
    });
  });

  it("returns an empty object if no metadata is found", function () {
    var metadata = describedClass.extract('\n\
      c Sentient Machine Code, Version 1.0 \n\
      p cnf 1 1                            \n\
      1 0                                  \n\
    ');

    expect(metadata).toEqual({});
  });

  it("throws an error on mismatched outer curly braces", function () {
    expect(function () {
      describedClass.extract('               \n\
        c Sentient Machine Code, Version 1.0 \n\
        c {                                  \n\
        c   "foo": "bar",                    \n\
        p cnf 1 1                            \n\
        1 0                                  \n\
      ');
    }).toThrow();
  });
});
