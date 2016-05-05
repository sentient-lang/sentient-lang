"use strict";

var compiler = "../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level4Compiler");
var StandardLibrary = require(compiler + "/level4Compiler/standardLibrary");

describe("Level4Compiler", function () {
  var standardLibrary, withStandardLibrary;

  beforeEach(function () {
    standardLibrary = new StandardLibrary();

    withStandardLibrary = function (expected) {
      return {
        instructions: standardLibrary.instructions.concat(
          expected.instructions
        )
      };
    };
  });

  it("compiles a simple program", function () {
    var code = describedClass.compile("\n\
      int6 a, b;                       \n\
      total = a + b;                   \n\
      vary a, b, total;                \n\
    ");

    expect(code).toEqual(withStandardLibrary({
      instructions: [
        { type: "integer", symbol: "a", width: 6 },
        { type: "integer", symbol: "b", width: 6 },
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "call", name: "+", width: 2 },
        { type: "pop", symbol: "total" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "total" }
      ]
    }));
  });

  it("compiles a program that uses destructuring", function () {
    var code = describedClass.compile("\n\
      int6 a, b;                       \n\
      div, mod =* a.divmod(b);         \n\
      vary a, b, div, mod;             \n\
    ");

    expect(code).toEqual(withStandardLibrary({
      instructions: [
        { type: "integer", symbol: "a", width: 6 },
        { type: "integer", symbol: "b", width: 6 },
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "call", name: "divmod", width: 2 },
        { type: "pop", symbol: "div" },
        { type: "pop", symbol: "mod" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "div" },
        { type: "variable", symbol: "mod" }
      ]
    }));
  });

  it("compiles a program that uses functions", function () {
    var code = describedClass.compile("\n\
      function double (x) {            \n\
        return x * 2;                  \n\
      };                               \n\
                                       \n\
      a = 111;                         \n\
      b = double(a);                   \n\
      c = double(b);                   \n\
                                       \n\
      vary a, b, c;                    \n\
    ");

    expect(code).toEqual(withStandardLibrary({
      instructions: [
        { type: "define", name: "double", dynamic: false, args: ["x"] },
        { type: "push", symbol: "x" },
        { type: "constant", value: 2 },
        { type: "call", name: "*", width: 2 },
        { type: "return", width: 1 },

        { type: "constant", value: 111 },
        { type: "pop", symbol: "a" },
        { type: "push", symbol: "a" },
        { type: "call", name: "double", width: 1 },
        { type: "pop", symbol: "b" },
        { type: "push", symbol: "b" },
        { type: "call", name: "double", width: 1 },
        { type: "pop", symbol: "c" },

        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" }
      ]
    }));
  });

  it("compiles a complicated program", function () {
    var code = describedClass.compile("                                      \n\
      london_edges     = [1, 2, 4];                                          \n\
      brighton_edges   = [0, 2];                                             \n\
      bristol_edges    = [0, 3];                                             \n\
      cardiff_edges    = [2, 5];                                             \n\
      cambridge_edges  = [0, 5, 6];                                          \n\
      birmingham_edges = [3, 4];                                             \n\
      nottingham_edges = [4];                                                \n\
                                                                             \n\
      graph = [                                                              \n\
        london_edges,                                                        \n\
        brighton_edges,                                                      \n\
        bristol_edges,                                                       \n\
        cardiff_edges,                                                       \n\
        cambridge_edges,                                                     \n\
        birmingham_edges,                                                    \n\
        nottingham_edges                                                     \n\
      ];                                                                     \n\
                                                                             \n\
      array7<int6> route, edge_indexes;                                      \n\
                                                                             \n\
      city_sales = [                                                         \n\
        0,     # London                                                      \n\
        3100,  # Brighton                                                    \n\
        1500,  # Bristol                                                     \n\
        3500,  # Cardiff                                                     \n\
        2300,  # Cambridge                                                   \n\
        2200,  # Birmingham                                                  \n\
        2200   # Nottingham                                                  \n\
      ];                                                                     \n\
                                                                             \n\
      total_revenue, fuel_cost = 0, 0;                                       \n\
                                                                             \n\
      # The delivery truck starts and ends in London.                        \n\
      invariant route[0] == 0;                                               \n\
      invariant route[6] == 0;                                               \n\
                                                                             \n\
      # Move the delivery truck (1st time).                                  \n\
      iteration = 0;                                                         \n\
      current = route[iteration];                                            \n\
      next = route[iteration + 1];                                           \n\
      invariant graph[current][edge_indexes[iteration]] == next;             \n\
                                                                             \n\
      total_revenue += city_sales[current];                                  \n\
      in_cambridge = current == 4;                                           \n\
      fuel_cost += in_cambridge ? 50 : 30;                                   \n\
                                                                             \n\
                                                                             \n\
      # Move the delivery truck (2nd time).                                  \n\
      iteration = 1;                                                         \n\
      current = route[iteration];                                            \n\
      next = route[iteration + 1];                                           \n\
      invariant graph[current][edge_indexes[iteration]] == next;             \n\
                                                                             \n\
      total_revenue += city_sales[current];                                  \n\
      in_cambridge = current == 4;                                           \n\
      fuel_cost += in_cambridge ? 50 : 30;                                   \n\
                                                                             \n\
                                                                             \n\
      # Move the delivery truck (3rd time).                                  \n\
      iteration = 2;                                                         \n\
      current = route[iteration];                                            \n\
      next = route[iteration + 1];                                           \n\
      invariant graph[current][edge_indexes[iteration]] == next;             \n\
                                                                             \n\
      total_revenue += city_sales[current];                                  \n\
      in_cambridge = current == 4;                                           \n\
      fuel_cost += in_cambridge ? 50 : 30;                                   \n\
                                                                             \n\
                                                                             \n\
      # Move the delivery truck (4th time).                                  \n\
      iteration = 3;                                                         \n\
      current = route[iteration];                                            \n\
      next = route[iteration + 1];                                           \n\
      invariant graph[current][edge_indexes[iteration]] == next;             \n\
                                                                             \n\
      total_revenue += city_sales[current];                                  \n\
      in_cambridge = current == 4;                                           \n\
      fuel_cost += in_cambridge ? 50 : 30;                                   \n\
                                                                             \n\
                                                                             \n\
      # Move the delivery truck (5th time).                                  \n\
      iteration = 4;                                                         \n\
      current = route[iteration];                                            \n\
      next = route[iteration + 1];                                           \n\
      invariant graph[current][edge_indexes[iteration]] == next;             \n\
                                                                             \n\
      total_revenue += city_sales[current];                                  \n\
      in_cambridge = current == 4;                                           \n\
      fuel_cost += in_cambridge ? 50 : 30;                                   \n\
                                                                             \n\
                                                                             \n\
      # Move the delivery truck (6th time).                                  \n\
      iteration = 5;                                                         \n\
      current = route[iteration];                                            \n\
      next = route[iteration + 1];                                           \n\
      invariant graph[current][edge_indexes[iteration]] == next;             \n\
                                                                             \n\
      total_revenue += city_sales[current];                                  \n\
      in_cambridge = current == 4;                                           \n\
      fuel_cost += in_cambridge ? 50 : 30;                                   \n\
                                                                             \n\
      total_revenue -= fuel_cost;                                            \n\
      surplus = total_revenue - 12012;                                       \n\
      shopping_cost = 4 * 7 + 40;                                            \n\
      shopping_purchased = surplus >= shopping_cost;                         \n\
                                                                             \n\
      total_revenue -= shopping_purchased ? shopping_cost : 0;               \n\
      surplus -= shopping_purchased ? shopping_cost : 0;                     \n\
                                                                             \n\
      invariant total_revenue >= 12012;                                      \n\
      money_to_keep = surplus / 3;                                           \n\
                                                                             \n\
      vary route,                                                            \n\
        total_revenue,                                                       \n\
        surplus,                                                             \n\
        fuel_cost,                                                           \n\
        shopping_cost,                                                       \n\
        shopping_purchased,                                                  \n\
        money_to_keep;                                                       \n\
    ");

    expect(code).toEqual(withStandardLibrary({
      instructions: [
        { type: 'constant', value: 1 },
        { type: 'constant', value: 2 },
        { type: 'constant', value: 4 },
        { type: 'collect', width: 3 },
        { type: 'pop', symbol: 'london_edges' },
        { type: 'constant', value: 0 },
        { type: 'constant', value: 2 },
        { type: 'collect', width: 2 },
        { type: 'pop', symbol: 'brighton_edges' },
        { type: 'constant', value: 0 },
        { type: 'constant', value: 3 },
        { type: 'collect', width: 2 },
        { type: 'pop', symbol: 'bristol_edges' },
        { type: 'constant', value: 2 },
        { type: 'constant', value: 5 },
        { type: 'collect', width: 2 },
        { type: 'pop', symbol: 'cardiff_edges' },
        { type: 'constant', value: 0 },
        { type: 'constant', value: 5 },
        { type: 'constant', value: 6 },
        { type: 'collect', width: 3 },
        { type: 'pop', symbol: 'cambridge_edges' },
        { type: 'constant', value: 3 },
        { type: 'constant', value: 4 },
        { type: 'collect', width: 2 },
        { type: 'pop', symbol: 'birmingham_edges' },
        { type: 'constant', value: 4 },
        { type: 'collect', width: 1 },
        { type: 'pop', symbol: 'nottingham_edges' },
        { type: 'push', symbol: 'london_edges' },
        { type: 'push', symbol: 'brighton_edges' },
        { type: 'push', symbol: 'bristol_edges' },
        { type: 'push', symbol: 'cardiff_edges' },
        { type: 'push', symbol: 'cambridge_edges' },
        { type: 'push', symbol: 'birmingham_edges' },
        { type: 'push', symbol: 'nottingham_edges' },
        { type: 'collect', width: 7 },
        { type: 'pop', symbol: 'graph' },
        { type: 'typedef', name: 'integer', width: 6 },
        { type: 'array', width: 7, symbol: 'route' },
        { type: 'typedef', name: 'integer', width: 6 },
        { type: 'array', width: 7, symbol: 'edge_indexes' },
        { type: 'constant', value: 0 },
        { type: 'constant', value: 3100 },
        { type: 'constant', value: 1500 },
        { type: 'constant', value: 3500 },
        { type: 'constant', value: 2300 },
        { type: 'constant', value: 2200 },
        { type: 'constant', value: 2200 },
        { type: 'collect', width: 7 },
        { type: 'pop', symbol: 'city_sales' },
        { type: 'constant', value: 0 },
        { type: 'pop', symbol: 'total_revenue' },
        { type: 'constant', value: 0 },
        { type: 'pop', symbol: 'fuel_cost' },
        { type: 'push', symbol: 'route' },
        { type: 'constant', value: 0 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'constant', value: 0 },
        { type: 'call', name: '==', width: 2 },
        { type: 'invariant' },
        { type: 'push', symbol: 'route' },
        { type: 'constant', value: 6 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'constant', value: 0 },
        { type: 'call', name: '==', width: 2 },
        { type: 'invariant' },
        { type: 'constant', value: 0 },
        { type: 'pop', symbol: 'iteration' },
        { type: 'push', symbol: 'route' },
        { type: 'push', symbol: 'iteration' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'pop', symbol: 'current' },
        { type: 'push', symbol: 'route' },
        { type: 'push', symbol: 'iteration' },
        { type: 'constant', value: 1 },
        { type: 'call', name: '+', width: 2 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'pop', symbol: 'next' },
        { type: 'push', symbol: 'graph' },
        { type: 'push', symbol: 'current' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'push', symbol: 'edge_indexes' },
        { type: 'push', symbol: 'iteration' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'push', symbol: 'next' },
        { type: 'call', name: '==', width: 2 },
        { type: 'invariant' },
        { type: 'push', symbol: 'total_revenue' },
        { type: 'push', symbol: 'city_sales' },
        { type: 'push', symbol: 'current' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'total_revenue' },
        { type: 'push', symbol: 'current' },
        { type: 'constant', value: 4 },
        { type: 'call', name: '==', width: 2 },
        { type: 'pop', symbol: 'in_cambridge' },
        { type: 'push', symbol: 'fuel_cost' },
        { type: 'push', symbol: 'in_cambridge' },
        { type: 'constant', value: 50 },
        { type: 'constant', value: 30 },
        { type: 'call', name: 'if', width: 3 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'fuel_cost' },
        { type: 'constant', value: 1 },
        { type: 'pop', symbol: 'iteration' },
        { type: 'push', symbol: 'route' },
        { type: 'push', symbol: 'iteration' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'pop', symbol: 'current' },
        { type: 'push', symbol: 'route' },
        { type: 'push', symbol: 'iteration' },
        { type: 'constant', value: 1 },
        { type: 'call', name: '+', width: 2 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'pop', symbol: 'next' },
        { type: 'push', symbol: 'graph' },
        { type: 'push', symbol: 'current' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'push', symbol: 'edge_indexes' },
        { type: 'push', symbol: 'iteration' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'push', symbol: 'next' },
        { type: 'call', name: '==', width: 2 },
        { type: 'invariant' },
        { type: 'push', symbol: 'total_revenue' },
        { type: 'push', symbol: 'city_sales' },
        { type: 'push', symbol: 'current' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'total_revenue' },
        { type: 'push', symbol: 'current' },
        { type: 'constant', value: 4 },
        { type: 'call', name: '==', width: 2 },
        { type: 'pop', symbol: 'in_cambridge' },
        { type: 'push', symbol: 'fuel_cost' },
        { type: 'push', symbol: 'in_cambridge' },
        { type: 'constant', value: 50 },
        { type: 'constant', value: 30 },
        { type: 'call', name: 'if', width: 3 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'fuel_cost' },
        { type: 'constant', value: 2 },
        { type: 'pop', symbol: 'iteration' },
        { type: 'push', symbol: 'route' },
        { type: 'push', symbol: 'iteration' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'pop', symbol: 'current' },
        { type: 'push', symbol: 'route' },
        { type: 'push', symbol: 'iteration' },
        { type: 'constant', value: 1 },
        { type: 'call', name: '+', width: 2 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'pop', symbol: 'next' },
        { type: 'push', symbol: 'graph' },
        { type: 'push', symbol: 'current' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'push', symbol: 'edge_indexes' },
        { type: 'push', symbol: 'iteration' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'push', symbol: 'next' },
        { type: 'call', name: '==', width: 2 },
        { type: 'invariant' },
        { type: 'push', symbol: 'total_revenue' },
        { type: 'push', symbol: 'city_sales' },
        { type: 'push', symbol: 'current' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'total_revenue' },
        { type: 'push', symbol: 'current' },
        { type: 'constant', value: 4 },
        { type: 'call', name: '==', width: 2 },
        { type: 'pop', symbol: 'in_cambridge' },
        { type: 'push', symbol: 'fuel_cost' },
        { type: 'push', symbol: 'in_cambridge' },
        { type: 'constant', value: 50 },
        { type: 'constant', value: 30 },
        { type: 'call', name: 'if', width: 3 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'fuel_cost' },
        { type: 'constant', value: 3 },
        { type: 'pop', symbol: 'iteration' },
        { type: 'push', symbol: 'route' },
        { type: 'push', symbol: 'iteration' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'pop', symbol: 'current' },
        { type: 'push', symbol: 'route' },
        { type: 'push', symbol: 'iteration' },
        { type: 'constant', value: 1 },
        { type: 'call', name: '+', width: 2 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'pop', symbol: 'next' },
        { type: 'push', symbol: 'graph' },
        { type: 'push', symbol: 'current' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'push', symbol: 'edge_indexes' },
        { type: 'push', symbol: 'iteration' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'push', symbol: 'next' },
        { type: 'call', name: '==', width: 2 },
        { type: 'invariant' },
        { type: 'push', symbol: 'total_revenue' },
        { type: 'push', symbol: 'city_sales' },
        { type: 'push', symbol: 'current' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'total_revenue' },
        { type: 'push', symbol: 'current' },
        { type: 'constant', value: 4 },
        { type: 'call', name: '==', width: 2 },
        { type: 'pop', symbol: 'in_cambridge' },
        { type: 'push', symbol: 'fuel_cost' },
        { type: 'push', symbol: 'in_cambridge' },
        { type: 'constant', value: 50 },
        { type: 'constant', value: 30 },
        { type: 'call', name: 'if', width: 3 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'fuel_cost' },
        { type: 'constant', value: 4 },
        { type: 'pop', symbol: 'iteration' },
        { type: 'push', symbol: 'route' },
        { type: 'push', symbol: 'iteration' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'pop', symbol: 'current' },
        { type: 'push', symbol: 'route' },
        { type: 'push', symbol: 'iteration' },
        { type: 'constant', value: 1 },
        { type: 'call', name: '+', width: 2 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'pop', symbol: 'next' },
        { type: 'push', symbol: 'graph' },
        { type: 'push', symbol: 'current' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'push', symbol: 'edge_indexes' },
        { type: 'push', symbol: 'iteration' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'push', symbol: 'next' },
        { type: 'call', name: '==', width: 2 },
        { type: 'invariant' },
        { type: 'push', symbol: 'total_revenue' },
        { type: 'push', symbol: 'city_sales' },
        { type: 'push', symbol: 'current' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'total_revenue' },
        { type: 'push', symbol: 'current' },
        { type: 'constant', value: 4 },
        { type: 'call', name: '==', width: 2 },
        { type: 'pop', symbol: 'in_cambridge' },
        { type: 'push', symbol: 'fuel_cost' },
        { type: 'push', symbol: 'in_cambridge' },
        { type: 'constant', value: 50 },
        { type: 'constant', value: 30 },
        { type: 'call', name: 'if', width: 3 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'fuel_cost' },
        { type: 'constant', value: 5 },
        { type: 'pop', symbol: 'iteration' },
        { type: 'push', symbol: 'route' },
        { type: 'push', symbol: 'iteration' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'pop', symbol: 'current' },
        { type: 'push', symbol: 'route' },
        { type: 'push', symbol: 'iteration' },
        { type: 'constant', value: 1 },
        { type: 'call', name: '+', width: 2 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'pop', symbol: 'next' },
        { type: 'push', symbol: 'graph' },
        { type: 'push', symbol: 'current' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'push', symbol: 'edge_indexes' },
        { type: 'push', symbol: 'iteration' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'call', name: '[]', width: 2 },
        { type: 'push', symbol: 'next' },
        { type: 'call', name: '==', width: 2 },
        { type: 'invariant' },
        { type: 'push', symbol: 'total_revenue' },
        { type: 'push', symbol: 'city_sales' },
        { type: 'push', symbol: 'current' },
        { type: 'call', name: '[]', width: 2 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'total_revenue' },
        { type: 'push', symbol: 'current' },
        { type: 'constant', value: 4 },
        { type: 'call', name: '==', width: 2 },
        { type: 'pop', symbol: 'in_cambridge' },
        { type: 'push', symbol: 'fuel_cost' },
        { type: 'push', symbol: 'in_cambridge' },
        { type: 'constant', value: 50 },
        { type: 'constant', value: 30 },
        { type: 'call', name: 'if', width: 3 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'fuel_cost' },
        { type: 'push', symbol: 'total_revenue' },
        { type: 'push', symbol: 'fuel_cost' },
        { type: 'call', name: '-', width: 2 },
        { type: 'pop', symbol: 'total_revenue' },
        { type: 'push', symbol: 'total_revenue' },
        { type: 'constant', value: 12012 },
        { type: 'call', name: '-', width: 2 },
        { type: 'pop', symbol: 'surplus' },
        { type: 'constant', value: 4 },
        { type: 'constant', value: 7 },
        { type: 'call', name: '*', width: 2 },
        { type: 'constant', value: 40 },
        { type: 'call', name: '+', width: 2 },
        { type: 'pop', symbol: 'shopping_cost' },
        { type: 'push', symbol: 'surplus' },
        { type: 'push', symbol: 'shopping_cost' },
        { type: 'call', name: '>=', width: 2 },
        { type: 'pop', symbol: 'shopping_purchased' },
        { type: 'push', symbol: 'total_revenue' },
        { type: 'push', symbol: 'shopping_purchased' },
        { type: 'push', symbol: 'shopping_cost' },
        { type: 'constant', value: 0 },
        { type: 'call', name: 'if', width: 3 },
        { type: 'call', name: '-', width: 2 },
        { type: 'pop', symbol: 'total_revenue' },
        { type: 'push', symbol: 'surplus' },
        { type: 'push', symbol: 'shopping_purchased' },
        { type: 'push', symbol: 'shopping_cost' },
        { type: 'constant', value: 0 },
        { type: 'call', name: 'if', width: 3 },
        { type: 'call', name: '-', width: 2 },
        { type: 'pop', symbol: 'surplus' },
        { type: 'push', symbol: 'total_revenue' },
        { type: 'constant', value: 12012 },
        { type: 'call', name: '>=', width: 2 },
        { type: 'invariant' },
        { type: 'push', symbol: 'surplus' },
        { type: 'constant', value: 3 },
        { type: 'call', name: '/', width: 2 },
        { type: 'pop', symbol: 'money_to_keep' },
        { type: 'variable', symbol: 'route' },
        { type: 'variable', symbol: 'total_revenue' },
        { type: 'variable', symbol: 'surplus' },
        { type: 'variable', symbol: 'fuel_cost' },
        { type: 'variable', symbol: 'shopping_cost' },
        { type: 'variable', symbol: 'shopping_purchased' },
        { type: 'variable', symbol: 'money_to_keep' }
      ]
    }));
  });
});
