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

    var message = error.message.substring(0, 51);
    expect(message).toEqual(
      "sentient:1:8: syntax error, unexpected end-of-input"
    );
  });

  it("throws on an unexpected symbol", function () {
    var error = captureError(function () {
      describedClass.parse("a = 123 @");
    });

    var message = error.message.substring(0, 42);
    expect(message).toEqual("sentient:1:9: syntax error, unexpected '@'");
  });

  it("sets the originating level to 4", function () {
    var error = captureError(function () {
      describedClass.parse("a = 123 @");
    });

    var message = error.message.substring(0, 42);

    expect(error.originatingLevel).toEqual("syntax");
    expect(message).toEqual("sentient:1:9: syntax error, unexpected '@'");
  });
});
