"use strict";

var Sentient = require("../../../../lib/sentient");

describe("function passing", function () {
  it("supports passing functions to other functions", function () {
    var program = Sentient.compile("     \n\
      function foo (*func) {             \n\
        return func();                   \n\
      };                                 \n\
                                         \n\
      function bar () {                  \n\
        return 123;                      \n\
      };                                 \n\
                                         \n\
      a = foo(*bar);                     \n\
      vary a;                            \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 123 });
  });

  it("can detect recursive function calls", function () {
    expect(function () {
      Sentient.compile("function foo (*f) { f(*f); }; foo(*foo);");
    }).toThrow();

    expect(function () {
      Sentient.compile("                \n\
        function foo (*x) { x(*bar); }; \n\
        function bar (*y) { y(*foo); }; \n\
        foo(*bar);                      \n\
      ");
    }).toThrow();
  });
});
