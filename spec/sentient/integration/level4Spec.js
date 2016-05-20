/* jshint camelcase:false */

"use strict";

var Level4Compiler = require("../../../lib/sentient/compiler/level4Compiler");
var Level3Compiler = require("../../../lib/sentient/compiler/level3Compiler");
var Level2Compiler = require("../../../lib/sentient/compiler/level2Compiler");
var Level1Compiler = require("../../../lib/sentient/compiler/level1Compiler");

var Level4Runtime = require("../../../lib/sentient/runtime/level4Runtime");
var Level3Runtime = require("../../../lib/sentient/runtime/level3Runtime");
var Level2Runtime = require("../../../lib/sentient/runtime/level2Runtime");
var Level1Runtime = require("../../../lib/sentient/runtime/level1Runtime");

var Machine = require("../../../lib/sentient/machine");

describe("Level 4 Abstraction", function () {
  var program, level1Code, level2Code, level3Code;

  beforeEach(function () {
    level3Code = Level4Compiler.compile("                                    \n\
       # A Sentient program to solve the unbounded knapsack problem.         \n\
                                                                             \n\
       item_values = [3, 7, 20];                                             \n\
       item_weights = [2, 4, 10];                                            \n\
                                                                             \n\
       array3<int12> number_of_each_item;                                    \n\
       total_value, total_weight = 0, 0;                                     \n\
                                                                             \n\
       invariant number_of_each_item[0] >= 0;                                \n\
       total_value += item_values[0] * number_of_each_item[0];               \n\
       total_weight += item_weights[0] * number_of_each_item[0];             \n\
                                                                             \n\
       invariant number_of_each_item[1] >= 0;                                \n\
       total_value += item_values[1] * number_of_each_item[1];               \n\
       total_weight += item_weights[1] * number_of_each_item[1];             \n\
                                                                             \n\
       invariant number_of_each_item[2] >= 0;                                \n\
       total_value += item_values[2] * number_of_each_item[2];               \n\
       total_weight += item_weights[2] * number_of_each_item[2];             \n\
                                                                             \n\
       expose number_of_each_item, total_weight, total_value;                \n\
                                                                             \n\
       int12 knapsack_size;                                                  \n\
       invariant total_weight <= knapsack_size;                              \n\
       invariant knapsack_size > 0;                                          \n\
                                                                             \n\
       int12 target_value;                                                   \n\
       invariant total_value >= target_value;                                \n\
       invariant target_value > 0;                                           \n\
                                                                             \n\
       expose knapsack_size, target_value;                                   \n\
    ");

    level2Code = Level3Compiler.compile(level3Code);
    level1Code = Level2Compiler.compile(level2Code);
    program = Level1Compiler.compile(level1Code);
  });

  it("can find a solution for size=50, target=95", function () {
    var assignments = { knapsack_size: 50, target_value: 95 };
    assignments = Level4Runtime.encode(program, assignments);
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);
    result = Level4Runtime.decode(program, result);

    expect(result).toEqual({
      knapsack_size: 50,
      target_value: 95,
      number_of_each_item: [0, 0, 5],
      total_weight: 50,
      total_value: 100
    });
  });

  it("can find a solution for size=999, target=1993", function () {
    var assignments = { knapsack_size: 999, target_value: 1993 };
    assignments = Level4Runtime.encode(program, assignments);
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);
    result = Level4Runtime.decode(program, result);

    expect(result).toEqual({
      knapsack_size: 999,
      target_value: 1993,
      number_of_each_item: [0, 2, 99],
      total_weight: 998,
      total_value: 1994
    });
  });

  it("can find a solution that uses 2 of the second item", function () {
    var assignments = {
      knapsack_size: 999,
      target_value: 1993,
      number_of_each_item: { 1: 2 }
    };

    assignments = Level4Runtime.encode(program, assignments);
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);
    result = Level4Runtime.decode(program, result);

    expect(result).toEqual({
      knapsack_size: 999,
      target_value: 1993,
      number_of_each_item: [0, 2, 99],
      total_weight: 998,
      total_value: 1994
    });
  });

  it("cannot find a solution that does not use the second item", function () {
    var assignments = {
      knapsack_size: 999,
      target_value: 1993,
      number_of_each_item: { 1: 0 }
    };

    assignments = Level4Runtime.encode(program, assignments);
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);
    result = Level4Runtime.decode(program, result);

    expect(result).toEqual({});
  });

  it("can find a knapsack large enough to hold 1700 value", function () {
    var assignments = { target_value: 1700 };
    assignments = Level4Runtime.encode(program, assignments);
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);
    result = Level4Runtime.decode(program, result);

    expect(result).toEqual({
      knapsack_size: 1545,
      target_value: 1700,
      number_of_each_item: [151, 9, 115],
      total_weight: 1488,
      total_value: 2816
    });
  });

  it("can find a selection that weighs 1008 and has value 1967", function () {
    var assignments = { total_weight: 1008, total_value: 1967 };
    assignments = Level4Runtime.encode(program, assignments);
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);
    result = Level4Runtime.decode(program, result);

    expect(result).toEqual({
      knapsack_size: 1688,
      target_value: 859,
      number_of_each_item: [34, 15, 88],
      total_weight: 1008,
      total_value: 1967
    });
  });
});
