var Application = function () {
  var self = this;
  var program;

  var aInput = document.getElementById("a");
  var bInput = document.getElementById("b");
  var cInput = document.getElementById("c");
  var dInput = document.getElementById("d");
  var eInput = document.getElementById("e");

  var totalInput = document.getElementById("total");

  self.run = function () {
    program = compileProgram();
    self.update();
  };

  self.update = function () {
    var result = Sentient.run(program, {
      a: parseInt(aInput.value),
      b: parseInt(bInput.value),
      c: parseInt(cInput.value),
      d: parseInt(dInput.value),
      e: parseInt(eInput.value),
      total: parseInt(totalInput.value),
    });

    aInput.style.borderColor = "red";
    bInput.style.borderColor = "red";
    cInput.style.borderColor = "red";
    dInput.style.borderColor = "red";
    eInput.style.borderColor = "red";
    totalInput.style.borderColor = "red";

    if (result.a_present) { aInput.style.borderColor = "#0c0"; }
    if (result.b_present) { bInput.style.borderColor = "#0c0"; }
    if (result.c_present) { cInput.style.borderColor = "#0c0"; }
    if (result.d_present) { dInput.style.borderColor = "#0c0"; }
    if (result.e_present) { eInput.style.borderColor = "#0c0"; }
    if (result.total) { totalInput.style.borderColor = "#0c0"; }
  };

  var compileProgram = function () {
    var program = {
      "metadata": {
        "title": "Subset Sum",
        "description": "Find a subset of N integers that add up to a given total",
        "author": "Chris Patuzzo",
        "date": "2016-01-25"
      },
      "instructions": [
        { type: "integer", symbol: "a", width: 20 },
        { type: "integer", symbol: "b", width: 20 },
        { type: "integer", symbol: "c", width: 20 },
        { type: "integer", symbol: "d", width: 20 },
        { type: "integer", symbol: "e", width: 20 },

        { type: "boolean", symbol: "a_present" },
        { type: "boolean", symbol: "b_present" },
        { type: "boolean", symbol: "c_present" },
        { type: "boolean", symbol: "d_present" },
        { type: "boolean", symbol: "e_present" },

        { type: "integer", symbol: "total", width: 20 },

        { type: "push", symbol: "a_present" },
        { type: "push", symbol: "a" },
        { type: "constant", value: 0 },
        { type: "if" },

        { type: "push", symbol: "b_present" },
        { type: "push", symbol: "b" },
        { type: "constant", value: 0 },
        { type: "if" },

        { type: "push", symbol: "c_present" },
        { type: "push", symbol: "c" },
        { type: "constant", value: 0 },
        { type: "if" },

        { type: "push", symbol: "d_present" },
        { type: "push", symbol: "d" },
        { type: "constant", value: 0 },
        { type: "if" },

        { type: "push", symbol: "e_present" },
        { type: "push", symbol: "e" },
        { type: "constant", value: 0 },
        { type: "if" },

        { type: "add" },
        { type: "add" },
        { type: "add" },
        { type: "add" },

        { type: "push", symbol: "total" },
        { type: "equal" },
        { type: "invariant" },

        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "d" },
        { type: "variable", symbol: "e" },

        { type: "variable", symbol: "a_present" },
        { type: "variable", symbol: "b_present" },
        { type: "variable", symbol: "c_present" },
        { type: "variable", symbol: "d_present" },
        { type: "variable", symbol: "e_present" },

        { type: "variable", symbol: "total" }
      ]
    };

    return Sentient.compile(program);
  };
};
