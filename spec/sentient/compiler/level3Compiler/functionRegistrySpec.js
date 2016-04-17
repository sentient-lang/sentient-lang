"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level3Compiler/functionRegistry");

describe("FunctionRegistry", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("allows functions to be registered and retrieved", function () {
    var name = "foo";
    var args = ["bar", "baz"];
    var body = [
      { type: "push", symbol: "bar" },
      { type: "push", symbol: "baz" },
      { type: "call", name: "+" }
    ];
    var dynamic = true;
    var returns = 1;

    subject.register(name, args, body, dynamic, returns);

    var fn = subject.get(name);

    expect(fn.name).toEqual(name);
    expect(fn.args).toEqual(args);
    expect(fn.body).toEqual(body);
    expect(fn.dynamic).toEqual(dynamic);
    expect(fn.returns).toEqual(returns);
  });

  it("throws an error if getting a function that doesn't exist", function () {
    expect(function () {
      subject.get("missing");
    }).toThrow();
  });

  it("allows functions to be redefined", function () {
    var name = "foo";
    var args = ["bar", "baz"];
    var oldBody = ["oldBody"];
    var returns = 1;
    var dynamic = true;

    subject.register(name, args, oldBody, dynamic, returns);

    var newBody = ["newBody"];

    subject.register(name, args, newBody, dynamic, returns);

    var fn = subject.get(name);
    expect(fn.body).toEqual(newBody);
  });

  it("allows functions to be marked as 'builtIn'", function () {
    var name = "+";
    var args = ["left", "right"];
    var body = [
      { type: "push", symbol: "left" },
      { type: "push", symbol: "right" },
      { type: "system", call: "add" }
    ];
    var dynamic = true;
    var returns = 1;
    var builtIn = true;

    subject.register(name, args, body, dynamic, returns, builtIn);

    var fn = subject.get(name);

    expect(fn.builtIn).toEqual(true);
  });

  it("does not allow builtIn functions to be redefined", function () {
    subject.register("+", [], [], true, 1, true);

    expect(function () {
      subject.register("+", [], [], true, 1);
    }).toThrow();

    expect(function () {
      subject.register("+", [], [], true, 1, true);
    }).toThrow();
  });
});
