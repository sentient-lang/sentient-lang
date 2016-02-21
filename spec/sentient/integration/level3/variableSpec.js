"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");
var Level2Compiler = require(compiler + "/level2Compiler");
var Level3Compiler = require(compiler + "/level3Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");
var Level2Runtime = require(runtime + "/level2Runtime");
var Level3Runtime = require(runtime + "/level3Runtime");

var Machine = require("../../../../lib/sentient/machine");

var _ = require("underscore");

describe("Integration: 'variable'", function () {
  it("only exposes the specified variables", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "boolean", symbol: "a" },
        { type: "boolean", symbol: "b" },
        { type: "constant", value: true },
        { type: "constant", value: false },
        { type: "pop", symbol: "c" },
        { type: "pop", symbol: "d" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(_.keys(result)).toEqual(["b", "c"]);
  });

  it("works with arbitrarily nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: true },
        { type: "collect", width: 1 },
        { type: "constant", value: false },
        { type: "collect", width: 1 },
        { type: "collect", width: 2 },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "foo" },
        { type: "variable", symbol: "foo" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.foo).toEqual([[[true], [false]]]);
  });

  it("can assign array elements using the array syntax", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "foo", width: 4 },
        { type: "variable", symbol: "foo" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {
      foo: [[1, 2], [undefined, 3], undefined, [undefined, 5]]
    });

    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.foo).toEqual([
      [1, 2], [0, 3], [0, 0], [0, 5]
    ]);
  });

  it("can assign array elements using the object syntax", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "foo", width: 4 },
        { type: "variable", symbol: "foo" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {
      foo: {
        0: { 0: 1, 1: 2 },
        1: { 1: 3 },
        3: { 1: 5 }
      }
    });

    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.foo).toEqual([
      [1, 2], [0, 3], [0, 0], [0, 5]
    ]);
  });

  it("can assign array elements using a mixture of syntax", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "foo", width: 4 },
        { type: "variable", symbol: "foo" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {
      foo: {
        0: [1, 2],
        1: { 1: 3 },
        2: undefined,
        3: { 1: 5 }
      }
    });

    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.foo).toEqual([
      [1, 2], [0, 3], [0, 0], [0, 5]
    ]);
  });

  it("throws an error if the variable is not declared", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "variable", symbol: "missing" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if elements are missing", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "typedef", name: "integer", width: 6 },
        { type: "array", symbol: "foo", width: 4 },
        { type: "variable", symbol: "foo" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    expect(function () {
      Level3Runtime.encode(program, { foo: [1, 2, 3] });
    }).toThrow();
  });

  it("excludes nulls from transposed arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "integer", symbol: "a", width: 8 },
        { type: "integer", symbol: "b", width: 8 },
        { type: "integer", symbol: "c", width: 8 },
        { type: "integer", symbol: "d", width: 8 },
        { type: "integer", symbol: "e", width: 8 },
        { type: "integer", symbol: "f", width: 8 },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "d" },
        { type: "variable", symbol: "e" },
        { type: "variable", symbol: "f" },

        // foo = [a, b]
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },
        { type: "variable", symbol: "foo" },

        // bar = [c]
        { type: "push", symbol: "c" },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "bar" },
        { type: "variable", symbol: "bar" },

        // baz = [foo, bar] = [[a, b], [c]]
        { type: "push", symbol: "foo" },
        { type: "push", symbol: "bar" },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "baz" },
        { type: "variable", symbol: "baz" },

        // qux = [d, e, f]
        { type: "push", symbol: "d" },
        { type: "push", symbol: "e" },
        { type: "push", symbol: "f" },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "qux" },
        { type: "variable", symbol: "qux" },

        // abc = [qux] = [[d, e, f]]
        { type: "push", symbol: "qux" },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "abc" },
        { type: "variable", symbol: "abc" },

        // def
        // = [baz, abc]
        // = [[foo, bar], [qux]]
        // = [[[a, b], [c]], [[d, e, f]]]
        { type: "push", symbol: "baz" },
        { type: "push", symbol: "abc" },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "def" },
        { type: "variable", symbol: "def" },

        // def[0][0] = foo
        { type: "push", symbol: "def" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "pop", symbol: "fooOut" },
        { type: "variable", symbol: "fooOut" },

        // def[0][1] = bar
        { type: "push", symbol: "def" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "pop", symbol: "barOut" },
        { type: "variable", symbol: "barOut" },

        // def[0] = baz
        { type: "push", symbol: "def" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "pop", symbol: "bazOut" },
        { type: "variable", symbol: "bazOut" },

        // def[1][0] = qux
        { type: "push", symbol: "def" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "pop", symbol: "quxOut" },
        { type: "variable", symbol: "quxOut" },

        // def[1] = abc
        { type: "push", symbol: "def" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "pop", symbol: "abcOut" },
        { type: "variable", symbol: "abcOut" },

        { type: "integer", symbol: "x", width: 8 },
        { type: "integer", symbol: "y", width: 8 },
        { type: "variable", symbol: "x" },
        { type: "variable", symbol: "y" },

        // def[x][y]
        { type: "push", symbol: "def" },
        { type: "push", symbol: "x" },
        { type: "get" },
        { type: "push", symbol: "y" },
        { type: "get" },
        { type: "pop", symbol: "z" },
        { type: "variable", symbol: "z" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {
      baz: [[10, 20], [30]],
      qux: { 0: 40, 2: 60 },
      e: 50,
      x: 0,
      y: 1
    });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.a).toEqual(10);
    expect(result.b).toEqual(20);
    expect(result.c).toEqual(30);
    expect(result.d).toEqual(40);
    expect(result.e).toEqual(50);
    expect(result.f).toEqual(60);

    expect(result.foo).toEqual([10, 20]);
    expect(result.bar).toEqual([30]);
    expect(result.baz).toEqual([[10, 20], [30]]);
    expect(result.qux).toEqual([40, 50, 60]);
    expect(result.abc).toEqual([[40, 50, 60]]);
    expect(result.def).toEqual([[[10, 20], [30]], [[40, 50, 60]]]);

    expect(result.fooOut).toEqual([10, 20]);
    expect(result.barOut).toEqual([30]);
    expect(result.bazOut).toEqual([[10, 20], [30]]);
    expect(result.quxOut).toEqual([40, 50, 60]);
    expect(result.abcOut).toEqual([[40, 50, 60]]);

    expect(result.z).toEqual([30]);
  });
});
