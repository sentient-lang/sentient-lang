"use strict";

var Level3Compiler = require("../../../lib/sentient/compiler/level3Compiler");
var Level3Runtime = require("../../../lib/sentient/runtime/level3Runtime");

var Level2Compiler = require("../../../lib/sentient/compiler/level2Compiler");
var Level2Runtime = require("../../../lib/sentient/runtime/level2Runtime");

var Level1Compiler = require("../../../lib/sentient/compiler/level1Compiler");
var Level1Runtime = require("../../../lib/sentient/runtime/level1Runtime");

var Machine = require("../../../lib/sentient/machine");

describe("Level 3 Abstraction", function () {
  var program, level1Code, level2Code;

  beforeEach(function () {
    level2Code = Level3Compiler.compile({
      metadata: {
        title: "A Baker's Dozen",

        description: "                                                         \
          Boole's Bakery would like to purchase a new Megamix 3000 in order to \
          grow its business. The retail price of one of these machines is      \
          usually 20,000 GBP, but it is currently on sale at 12,012 GBP. This  \
          sale price expires one week from now!                                \
                                                                               \
          In order to raise enough capital, the bakery intends to make urgent  \
          deliveries to its neighbouring cities. The bakery has a single       \
          delivery truck currently located in London which it will use for its \
          deliveries.                                                          \
                                                                               \
          The truck may visit a new city each day and must return to London by \
          the end of the week in order to pick up the new machinery. The truck \
          may visit the same city more than once, but must leave at least a    \
          day before returning to the same city to give that city long enough  \
          deplete its supplies.                                                \
                                                                               \
          The graph below shows the motorway network connecting the cities:    \
                                                                               \
                                                                               \
                                   Nottingham                                  \
                                  /         \                                  \
                           Birmingham ---- Cambridge                           \
                                |             |                                \
                             Cardiff .---- London                              \
                                |   /        |                                 \
                             Bristol ----- Brighton                            \
                                                                               \
                                                                               \
          The revenues raised by visiting each of these cities are as follows: \
                                                                               \
                                                                               \
          City       | Revenue                                                 \
          -----------|---------                                                \
          Birmingham | 2200 GBP                                                \
          Brighton   | 3100 GBP                                                \
          Bristol    | 1500 GBP                                                \
          Cambridge  | 2300 GBP                                                \
          Cardiff    | 3500 GBP                                                \
          Nottingham | 2200 GBP                                                \
                                                                               \
                                                                               \
          Can you help Boole's Bakery plan its route in order to raise enough  \
          capital to purchase the machinery it so desperately needs?           \
                                                                               \
          Oh, and by the way, keep in mind you'll need to refuel the delivery  \
          truck each day. It costs 30 GB except in Cambridge, where it's a bit \
          more expensive at 50 GBP. The truck starts with a full tank.         \
                                                                               \
          If there's any money left over, please could you purchase seven      \
          wooden spoons at 4 GBP each and some weighing scales at 40 GBP. You  \
          can keep a third of anything left.",

          author: "Chris Patuzzo",
          date: "2016-03-05"
      },
      instructions: [
        // Define the graph of connected cities.
        { type: "constant", value: 1 },
        { type: "constant", value: 2 },
        { type: "constant", value: 4 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "londonEdges" },

        { type: "constant", value: 0 },
        { type: "constant", value: 2 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "brightonEdges" },

        { type: "constant", value: 0 },
        { type: "constant", value: 3 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "bristolEdges" },

        { type: "constant", value: 2 },
        { type: "constant", value: 5 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "cardiffEdges" },

        { type: "constant", value: 0 },
        { type: "constant", value: 5 },
        { type: "constant", value: 6 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "cambridgeEdges" },

        { type: "constant", value: 3 },
        { type: "constant", value: 4 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "birminghamEdges" },

        { type: "constant", value: 4 },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "nottinghamEdges" },

        { type: "push", symbol: "londonEdges" },
        { type: "push", symbol: "brightonEdges" },
        { type: "push", symbol: "bristolEdges" },
        { type: "push", symbol: "cardiffEdges" },
        { type: "push", symbol: "cambridgeEdges" },
        { type: "push", symbol: "birminghamEdges" },
        { type: "push", symbol: "nottinghamEdges" },
        { type: "collect", width: 7 },
        { type: "pop", symbol: "graph" },

        // Define an array to hold the route and the edge indexes.
        { type: "typedef", name: "integer", width: 6 },
        { type: "array", width: 7, symbol: "route" },
        { type: "typedef", name: "integer", width: 6 },
        { type: "array", width: 7, symbol: "edgeIndexes" },

        // Define an array to hold the sales for each city.
        { type: "constant", value: 0 },
        { type: "constant", value: 3100 },
        { type: "constant", value: 1500 },
        { type: "constant", value: 3500 },
        { type: "constant", value: 2300 },
        { type: "constant", value: 2200 },
        { type: "constant", value: 2200 },
        { type: "collect", width: 7 },
        { type: "pop", symbol: "citySales" },

        // Define an integer to hold the total revenue.
        { type: "constant", value: 0 },
        { type: "pop", symbol: "totalRevenue" },

        // Define an integer to hold the cost of fuel.
        { type: "constant", value: 0 },
        { type: "pop", symbol: "fuelCost" },

        // The delivery truck starts in London.
        { type: "push", symbol: "route" },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "constant", value: 0 },
        { type: "equal" },
        { type: "invariant" },

        // The delivery truck must end in London.
        { type: "push", symbol: "route" },
        { type: "constant", value: 6 },
        { type: "fetch" },
        { type: "constant", value: 0 },
        { type: "equal" },
        { type: "invariant" },

        // Move the delivery truck (1st time).
        { type: "push", symbol: "graph" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "edgeIndexes" },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        // Add the sales from the city to the total.
        { type: "push", symbol: "citySales" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "totalRevenue" },
        { type: "add" },
        { type: "pop", symbol: "totalRevenue" },

        // Account for the cost of fuel.
        { type: "push", symbol: "route" },
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "constant", value: 50 },
        { type: "constant", value: 30 },
        { type: "if" },
        { type: "push", symbol: "fuelCost" },
        { type: "add" },
        { type: "pop", symbol: "fuelCost" },

        // Move the delivery truck (2nd time).
        { type: "push", symbol: "graph" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "edgeIndexes" },
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 2 },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        // Add the sales from the city to the total.
        { type: "push", symbol: "citySales" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 2 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "totalRevenue" },
        { type: "add" },
        { type: "pop", symbol: "totalRevenue" },

        // Account for the cost of fuel.
        { type: "push", symbol: "route" },
        { type: "constant", value: 2 },
        { type: "fetch" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "constant", value: 50 },
        { type: "constant", value: 30 },
        { type: "if" },
        { type: "push", symbol: "fuelCost" },
        { type: "add" },
        { type: "pop", symbol: "fuelCost" },

        // Move the delivery truck (3rd time).
        { type: "push", symbol: "graph" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 2 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "edgeIndexes" },
        { type: "constant", value: 3 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 3 },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        // Add the sales from the city to the total.
        { type: "push", symbol: "citySales" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 3 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "totalRevenue" },
        { type: "add" },
        { type: "pop", symbol: "totalRevenue" },

        // Account for the cost of fuel.
        { type: "push", symbol: "route" },
        { type: "constant", value: 3 },
        { type: "fetch" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "constant", value: 50 },
        { type: "constant", value: 30 },
        { type: "if" },
        { type: "push", symbol: "fuelCost" },
        { type: "add" },
        { type: "pop", symbol: "fuelCost" },

        // Move the delivery truck (4th time).
        { type: "push", symbol: "graph" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 3 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "edgeIndexes" },
        { type: "constant", value: 4 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 4 },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        // Add the sales from the city to the total.
        { type: "push", symbol: "citySales" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 4 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "totalRevenue" },
        { type: "add" },
        { type: "pop", symbol: "totalRevenue" },

        // Account for the cost of fuel.
        { type: "push", symbol: "route" },
        { type: "constant", value: 4 },
        { type: "fetch" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "constant", value: 50 },
        { type: "constant", value: 30 },
        { type: "if" },
        { type: "push", symbol: "fuelCost" },
        { type: "add" },
        { type: "pop", symbol: "fuelCost" },

        // Move the delivery truck (5th time).
        { type: "push", symbol: "graph" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 4 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "edgeIndexes" },
        { type: "constant", value: 5 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 5 },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        // Add the sales from the city to the total.
        { type: "push", symbol: "citySales" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 5 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "totalRevenue" },
        { type: "add" },
        { type: "pop", symbol: "totalRevenue" },

        // Account for the cost of fuel.
        { type: "push", symbol: "route" },
        { type: "constant", value: 5 },
        { type: "fetch" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "constant", value: 50 },
        { type: "constant", value: 30 },
        { type: "if" },
        { type: "push", symbol: "fuelCost" },
        { type: "add" },
        { type: "pop", symbol: "fuelCost" },

        // Move the delivery truck (6th time).
        { type: "push", symbol: "graph" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 5 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "edgeIndexes" },
        { type: "constant", value: 6 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 6 },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        // Add the sales from the city to the total.
        { type: "push", symbol: "citySales" },
        { type: "push", symbol: "route" },
        { type: "constant", value: 6 },
        { type: "fetch" },
        { type: "fetch" },
        { type: "push", symbol: "totalRevenue" },
        { type: "add" },
        { type: "pop", symbol: "totalRevenue" },

        // Account for the cost of fuel.
        { type: "push", symbol: "route" },
        { type: "constant", value: 6 },
        { type: "fetch" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "constant", value: 50 },
        { type: "constant", value: 30 },
        { type: "if" },
        { type: "push", symbol: "fuelCost" },
        { type: "add" },
        { type: "pop", symbol: "fuelCost" },

        // Deduct the cost of fuel from the total revenue.
        { type: "push", symbol: "totalRevenue" },
        { type: "push", symbol: "fuelCost" },
        { type: "subtract" },
        { type: "pop", symbol: "totalRevenue" },

        // Calculate the surplus after fuel has been deducted.
        { type: "push", symbol: "totalRevenue" },
        { type: "constant", value: 12012 },
        { type: "subtract" },
        { type: "pop", symbol: "surplus" },

        // Calculate how much to spend on wooden spoons and scales.
        { type: "constant", value: 4 },
        { type: "constant", value: 7 },
        { type: "multiply" },
        { type: "constant", value: 40 },
        { type: "add" },
        { type: "pop", symbol: "shoppingCost" },

        // Determine whether there's enough for the shopping.
        { type: "push", symbol: "surplus" },
        { type: "push", symbol: "shoppingCost" },
        { type: "greaterequal" },
        { type: "pop", symbol: "shoppingPurchased" },

        // Deduct the cost of shopping from revenue if shopping was purchased.
        { type: "push", symbol: "shoppingPurchased" },
        { type: "push", symbol: "totalRevenue" },
        { type: "push", symbol: "shoppingCost" },
        { type: "subtract" },
        { type: "push", symbol: "totalRevenue" },
        { type: "if" },
        { type: "pop", symbol: "totalRevenue" },

        // Deduct the cost of shopping from surplus if shopping was purchased.
        { type: "push", symbol: "shoppingPurchased" },
        { type: "push", symbol: "surplus" },
        { type: "push", symbol: "shoppingCost" },
        { type: "subtract" },
        { type: "push", symbol: "surplus" },
        { type: "if" },
        { type: "pop", symbol: "surplus" },

        // Insist that the total revenue be greater than £12,012.
        { type: "push", symbol: "totalRevenue" },
        { type: "constant", value: 12012 },
        { type: "greaterequal" },
        { type: "invariant" },

        // Calculate how much money to keep.
        { type: "push", symbol: "surplus" },
        { type: "constant", value: 3 },
        { type: "divide" },
        { type: "pop", symbol: "moneyToKeep" },

        // Expose the required information.
        { type: "variable", symbol: "route" },
        { type: "variable", symbol: "totalRevenue" },
        { type: "variable", symbol: "surplus" },
        { type: "variable", symbol: "fuelCost" },
        { type: "variable", symbol: "shoppingCost" },
        { type: "variable", symbol: "shoppingPurchased" },
        { type: "variable", symbol: "moneyToKeep" }
      ]
    });

    level1Code = Level2Compiler.compile(level2Code);
    program = Level1Compiler.compile(level1Code);
  });

  it("can find a solution that visits Cambridge on day 1", function () {
    var assignments = { route: { 1: 4 } };
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({
      route: [0, 4, 5, 3, 5, 4, 0],
      fuelCost: 220,
      shoppingPurchased: true,
      shoppingCost: 68,
      totalRevenue: 12212,
      surplus: 200,
      moneyToKeep: 66
    });
  });

  it("can find a solution that visits Bristol on day 1", function () {
    var assignments = { route: { 1: 1 } };
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({
      route: [0, 1, 2, 3, 5, 4, 0],
      fuelCost: 200,
      shoppingPurchased: true,
      shoppingCost: 68,
      totalRevenue: 12332,
      surplus: 320,
      moneyToKeep: 106
    });
  });

  it("can find a solution that can't afford to purchase shopping", function () {
    var assignments = { shoppingPurchased: false };
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({
      route: [0, 2, 3, 5, 3, 2, 0],
      fuelCost: 180,
      shoppingPurchased: false,
      shoppingCost: 68,
      totalRevenue: 12020,
      surplus: 8,
      moneyToKeep: 2
    });
  });

  it("verifes that there are no solutions with fuel costing 240", function () {
    var assignments = { fuelCost: 240 };
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({});
  });
});
