"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level3Compiler/functionRegistry");
var Registry = require(compiler + "/level3Compiler/registry");

describe("FunctionRegistry", function () {
  var subject, registry;

  beforeEach(function () {
    registry = new Registry();
    subject = new describedClass(registry);
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
    var immutable = false;
    var returns = 1;

    subject.register(name, args, body, dynamic, immutable, returns);

    var fn = subject.get(name);

    expect(fn.name).toEqual(name);
    expect(fn.args).toEqual(args);
    expect(fn.body).toEqual(body);
    expect(fn.dynamic).toEqual(dynamic);
    expect(fn.immutable).toEqual(immutable);
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
    var dynamic = true;
    var immutable = false;
    var returns = 1;

    subject.register(name, args, oldBody, dynamic, immutable, returns);

    var newBody = ["newBody"];

    subject.register(name, args, newBody, dynamic, immutable, returns);

    var fn = subject.get(name);
    expect(fn.body).toEqual(newBody);
  });

  it("allows functions to be marked as 'immutable'", function () {
    var name = "+";
    var args = ["left", "right"];
    var body = [
      { type: "push", symbol: "left" },
      { type: "push", symbol: "right" },
      { type: "system", call: "add" }
    ];
    var dynamic = true;
    var returns = 1;
    var immutable = true;

    subject.register(name, args, body, dynamic, immutable, returns);

    var fn = subject.get(name);

    expect(fn.immutable).toEqual(true);
  });

  it("does not allow immutable functions to be redefined", function () {
    subject.register("+", [], [], true, 1, true);

    expect(function () {
      subject.register("+", [], [], true, 1);
    }).toThrow();

    expect(function () {
      subject.register("+", [], [], true, 1, true);
    }).toThrow();
  });

  it("assigns a unique id to the function", function () {
    subject.register("foo", [], [], false, false, 0);
    expect(subject.get("foo").id).toEqual([1, "foo"]);

    subject.register("bar", [], [], false, false, 0);
    expect(subject.get("bar").id).toEqual([2, "bar"]);
  });
});
