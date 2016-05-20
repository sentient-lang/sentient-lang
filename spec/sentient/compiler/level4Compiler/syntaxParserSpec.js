"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level4Compiler/syntaxParser");

describe("SyntaxParser", function () {
  var captureError = function (fn) {
    var capturedError;

    try {
      fn();
    } catch (error) {
      capturedError = error;
    }

    return capturedError;
  };

  it("parses programs", function () {
    var ast = describedClass.parse("a = 123;");
    expect(ast).toEqual([ { type: "assignment", value: [["a"], [123]] } ]);
  });

  it("throws on an unexpected end-of-input", function () {
    var error = captureError(function () {
      describedClass.parse("a = 123");
    });

    var message = error.message.substring(0, 37);

    expect(error.name).toEqual("sentient:1:8");
    expect(message).toEqual("syntax error, unexpected end-of-input");
  });

  it("throws on an unexpected symbol", function () {
    var error = captureError(function () {
      describedClass.parse("a = 123 @");
    });

    var message = error.message.substring(0, 28);

    expect(error.name).toEqual("sentient:1:9");
    expect(message).toEqual("syntax error, unexpected '@'");
  });
});
