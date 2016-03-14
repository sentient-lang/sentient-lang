/* jshint maxlen: false */
/* globals document:false */

"use strict";

var Application = function () {
  var self = this;

  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  var numberButton = document.getElementById("numberButton");
  var numberInput = document.getElementById("numberInput");
  var errorSpan = document.getElementById("errorSpan");
  var cache = {};

  self.run = function () {
    compileProgram();
    runProgram();

    buildDigits();
    updateDigits();

    registerHandlers();

    render();
  };

  var runProgram = function () {
    var number = parseInt(numberInput.value, 10);
    errorSpan.innerText = "";

    if (number >= 1 && number <= 999) {
      cache[number] = cache[number] || Sentient.run(self.machineCode, { number: number });
      self.results = cache[number];

      if (typeof self.results.number === "undefined") {
        errorSpan.innerText = "There are no solutions for " + number + ".";
      }
    } else {
      errorSpan.innerText = "Invalid input, number must be between 1 and 999.";
    }
  };

  var buildDigits = function () {
    self.digits = [
      new Digit({ id: "hundreds", x: 25, y: 25 }),
      new Digit({ id: "tens", x: 225, y: 25 }),
      new Digit({ id: "ones", x: 425, y: 25 })
    ];
  };

  var updateDigits = function () {
    for (var i = 0; i < self.digits.length; i += 1) {
      var digit = self.digits[i];
      digit.update(self.results);
    }
  };

  var registerHandlers = function () {
    numberButton.addEventListener("click", function () {
      runProgram();
      updateDigits();
      render();
    });

    numberInput.addEventListener("keydown", function (event) {
      if (event.keyCode === 13) {
        runProgram();
        updateDigits();
        render();
      }
    });

    document.addEventListener("keyup", function (event) {
      if (document.activeElement === numberInput) {
        return;
      }

      var keyCode = event.keyCode;
      var number = parseInt(numberInput.value, 10);

      if (keyCode === 37 && number > 1) {
        event.preventDefault();
        numberInput.value = number - 1;
        numberButton.click();
        render();
      } else if (keyCode === 39 && number < 999) {
        event.preventDefault();
        numberInput.value = number + 1;
        numberButton.click();
        render();
      }
    });
  };

  var render = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < self.digits.length; i += 1) {
      var digit = self.digits[i];
      digit.render(context);
    }
  };

  var compileProgram = function () {
    var sourceCode = {
      "instructions": [
        { type: "integer", symbol: "number", width: 11 },

        // Allow integers in the range 0..999.
        { type: "push", symbol: "number" },
        { type: "constant", value: 0 },
        { type: "greaterequal" },
        { type: "invariant" },
        { type: "push", symbol: "number" },
        { type: "constant", value: 999 },
        { type: "lessequal" },
        { type: "invariant" },

        // Get the hundreds digit.
        { type: "push", symbol: "number" },
        { type: "constant", value: 100 },
        { type: "divmod" },
        { type: "pop", symbol: "hundreds" },

        // Get the tens digit.
        { type: "constant", value: 10 },
        { type: "divmod" },
        { type: "pop", symbol: "tens" },

        // Get the ones digit.
        { type: "pop", symbol: "ones" },

        // Determine whether each hundreds node is visible.
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "pop", symbol: "hundreds_top_left_visible" },
        { type: "constant", value: true },
        { type: "pop", symbol: "hundreds_top_right_visible" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "hundreds_middle_left_visible" },
        { type: "constant", value: true },
        { type: "pop", symbol: "hundreds_middle_right_visible" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "hundreds_bottom_left_visible" },
        { type: "constant", value: true },
        { type: "pop", symbol: "hundreds_bottom_right_visible" },

        // Determine whether each tens node is visible.
        { type: "push", symbol: "tens" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "pop", symbol: "tens_top_left_visible" },
        { type: "constant", value: true },
        { type: "pop", symbol: "tens_top_right_visible" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "tens_middle_left_visible" },
        { type: "constant", value: true },
        { type: "pop", symbol: "tens_middle_right_visible" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "tens_bottom_left_visible" },
        { type: "constant", value: true },
        { type: "pop", symbol: "tens_bottom_right_visible" },

        // Determine whether each ones node is visible.
        { type: "push", symbol: "ones" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "pop", symbol: "ones_top_left_visible" },
        { type: "constant", value: true },
        { type: "pop", symbol: "ones_top_right_visible" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "ones_middle_left_visible" },
        { type: "constant", value: true },
        { type: "pop", symbol: "ones_middle_right_visible" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "ones_bottom_left_visible" },
        { type: "constant", value: true },
        { type: "pop", symbol: "ones_bottom_right_visible" },

        // Determine whether each hundreds edge is visible.
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "hundreds_top_left_top_right_visible" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 0 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "hundreds_middle_left_middle_right_visible" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "hundreds_bottom_left_bottom_right_visible" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 2 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 3 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "hundreds_top_left_middle_left_visible" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 3 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 5 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 9 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "hundreds_middle_left_bottom_left_visible" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 5 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 6 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "hundreds_top_right_middle_right_visible" },
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 2 },
        { type: "equal" },
        { type: "not" },
        { type: "pop", symbol: "hundreds_middle_right_bottom_right_visible" },

        // Determine whether each tens edge is visible.
        { type: "push", symbol: "tens" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "tens_top_left_top_right_visible" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 0 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "tens_middle_left_middle_right_visible" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "tens_bottom_left_bottom_right_visible" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 2 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 3 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "tens_top_left_middle_left_visible" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 3 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 5 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 9 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "tens_middle_left_bottom_left_visible" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 5 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 6 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "tens_top_right_middle_right_visible" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 2 },
        { type: "equal" },
        { type: "not" },
        { type: "pop", symbol: "tens_middle_right_bottom_right_visible" },

        // Determine whether each ones edge is visible.
        { type: "push", symbol: "ones" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "ones_top_left_top_right_visible" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 0 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "ones_middle_left_middle_right_visible" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "ones_bottom_left_bottom_right_visible" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 2 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 3 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "ones_top_left_middle_left_visible" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 3 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 4 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 5 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 7 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 9 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "ones_middle_left_bottom_left_visible" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 5 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 6 },
        { type: "equal" },
        { type: "not" },
        { type: "and" },
        { type: "pop", symbol: "ones_top_right_middle_right_visible" },
        { type: "push", symbol: "ones" },
        { type: "constant", value: 2 },
        { type: "equal" },
        { type: "not" },
        { type: "pop", symbol: "ones_middle_right_bottom_right_visible" },

        // Determine whether hundreds/tens is visible at all.
        { type: "push", symbol: "hundreds" },
        { type: "constant", value: 0 },
        { type: "equal" },
        { type: "not" },
        { type: "pop", symbol: "hundreds_visible" },
        { type: "push", symbol: "tens" },
        { type: "constant", value: 0 },
        { type: "equal" },
        { type: "not" },
        { type: "push", symbol: "hundreds_visible" },
        { type: "or" },
        { type: "pop", symbol: "tens_visible" },

        // Override visibility of hundreds nodes if not visible.
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_top_left_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_top_left_visible" },
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_top_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_top_right_visible" },
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_middle_left_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_middle_left_visible" },
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_middle_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_middle_right_visible" },
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_bottom_left_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_bottom_left_visible" },
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_bottom_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_bottom_right_visible" },

        // Override visibility of tens nodes if not visible.
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_top_left_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_top_left_visible" },
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_top_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_top_right_visible" },
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_middle_left_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_middle_left_visible" },
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_middle_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_middle_right_visible" },
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_bottom_left_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_bottom_left_visible" },
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_bottom_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_bottom_right_visible" },

        // Override visibility of hundreds edges if not visibile.
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_top_left_top_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_top_left_top_right_visible" },
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_middle_left_middle_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_middle_left_middle_right_visible" },
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_bottom_left_bottom_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_bottom_left_bottom_right_visible" },
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_top_left_middle_left_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_top_left_middle_left_visible" },
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_middle_left_bottom_left_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_middle_left_bottom_left_visible" },
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_top_right_middle_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_top_right_middle_right_visible" },
        { type: "push", symbol: "hundreds_visible" },
        { type: "push", symbol: "hundreds_middle_right_bottom_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "hundreds_middle_right_bottom_right_visible" },

        // Override visibility of hundreds edges if not visibile.
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_top_left_top_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_top_left_top_right_visible" },
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_middle_left_middle_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_middle_left_middle_right_visible" },
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_bottom_left_bottom_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_bottom_left_bottom_right_visible" },
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_top_left_middle_left_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_top_left_middle_left_visible" },
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_middle_left_bottom_left_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_middle_left_bottom_left_visible" },
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_top_right_middle_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_top_right_middle_right_visible" },
        { type: "push", symbol: "tens_visible" },
        { type: "push", symbol: "tens_middle_right_bottom_right_visible" },
        { type: "constant", value: false },
        { type: "if" },
        { type: "pop", symbol: "tens_middle_right_bottom_right_visible" },

        // Define the colors.
        { type: "integer", symbol: "red", width: 11 },
        { type: "integer", symbol: "yellow", width: 11 },
        { type: "integer", symbol: "blue", width: 11 },
        { type: "push", symbol: "red" },
        { type: "push", symbol: "yellow" },
        { type: "push", symbol: "blue" },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "colors" },

        // colors cannot be negative numbers.
        { type: "push", symbol: "red" },
        { type: "constant", value: 0 },
        { type: "greaterequal" },
        { type: "invariant" },
        { type: "push", symbol: "yellow" },
        { type: "constant", value: 0 },
        { type: "greaterequal" },
        { type: "invariant" },
        { type: "push", symbol: "blue" },
        { type: "constant", value: 0 },
        { type: "greaterequal" },
        { type: "invariant" },

        // red != yellow
        { type: "push", symbol: "red" },
        { type: "push", symbol: "yellow" },
        { type: "equal" },
        { type: "not" },
        { type: "invariant" },

        // red != blue
        { type: "push", symbol: "red" },
        { type: "push", symbol: "blue" },
        { type: "equal" },
        { type: "not" },
        { type: "invariant" },

        // yellow != blue
        { type: "push", symbol: "yellow" },
        { type: "push", symbol: "blue" },
        { type: "equal" },
        { type: "not" },
        { type: "invariant" },

        // Define the nodes for the hundreds digit.
        { type: "integer", symbol: "hundreds_top_left", width: 3 },
        { type: "integer", symbol: "hundreds_top_right", width: 3 },
        { type: "integer", symbol: "hundreds_middle_left", width: 3 },
        { type: "integer", symbol: "hundreds_middle_right", width: 3 },
        { type: "integer", symbol: "hundreds_bottom_left", width: 3 },
        { type: "integer", symbol: "hundreds_bottom_right", width: 3 },

        // Define the nodes for the tens digit.
        { type: "integer", symbol: "tens_top_left", width: 3 },
        { type: "integer", symbol: "tens_top_right", width: 3 },
        { type: "integer", symbol: "tens_middle_left", width: 3 },
        { type: "integer", symbol: "tens_middle_right", width: 3 },
        { type: "integer", symbol: "tens_bottom_left", width: 3 },
        { type: "integer", symbol: "tens_bottom_right", width: 3 },

        // Define the nodes for the ones digit.
        { type: "integer", symbol: "ones_top_left", width: 3 },
        { type: "integer", symbol: "ones_top_right", width: 3 },
        { type: "integer", symbol: "ones_middle_left", width: 3 },
        { type: "integer", symbol: "ones_middle_right", width: 3 },
        { type: "integer", symbol: "ones_bottom_left", width: 3 },
        { type: "integer", symbol: "ones_bottom_right", width: 3 },

        // Set up invariants that colors differ for hundreds if edges visible.
        { type: "push", symbol: "hundreds_top_left_top_right_visible" },
        { type: "push", symbol: "hundreds_top_left" },
        { type: "push", symbol: "hundreds_top_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "hundreds_middle_left_middle_right_visible" },
        { type: "push", symbol: "hundreds_middle_left" },
        { type: "push", symbol: "hundreds_middle_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "hundreds_bottom_left_bottom_right_visible" },
        { type: "push", symbol: "hundreds_bottom_left" },
        { type: "push", symbol: "hundreds_bottom_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "hundreds_top_left_middle_left_visible" },
        { type: "push", symbol: "hundreds_top_left" },
        { type: "push", symbol: "hundreds_middle_left" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "hundreds_middle_left_bottom_left_visible" },
        { type: "push", symbol: "hundreds_middle_left" },
        { type: "push", symbol: "hundreds_bottom_left" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "hundreds_top_right_middle_right_visible" },
        { type: "push", symbol: "hundreds_top_right" },
        { type: "push", symbol: "hundreds_middle_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "hundreds_middle_right_bottom_right_visible" },
        { type: "push", symbol: "hundreds_middle_right" },
        { type: "push", symbol: "hundreds_bottom_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },

        // Set up invariants that colors differ for tens if edges visible.
        { type: "push", symbol: "tens_top_left_top_right_visible" },
        { type: "push", symbol: "tens_top_left" },
        { type: "push", symbol: "tens_top_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "tens_middle_left_middle_right_visible" },
        { type: "push", symbol: "tens_middle_left" },
        { type: "push", symbol: "tens_middle_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "tens_bottom_left_bottom_right_visible" },
        { type: "push", symbol: "tens_bottom_left" },
        { type: "push", symbol: "tens_bottom_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "tens_top_left_middle_left_visible" },
        { type: "push", symbol: "tens_top_left" },
        { type: "push", symbol: "tens_middle_left" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "tens_middle_left_bottom_left_visible" },
        { type: "push", symbol: "tens_middle_left" },
        { type: "push", symbol: "tens_bottom_left" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "tens_top_right_middle_right_visible" },
        { type: "push", symbol: "tens_top_right" },
        { type: "push", symbol: "tens_middle_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "tens_middle_right_bottom_right_visible" },
        { type: "push", symbol: "tens_middle_right" },
        { type: "push", symbol: "tens_bottom_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },

        // Set up invariants that colors differ for ones if edges visible.
        { type: "push", symbol: "ones_top_left_top_right_visible" },
        { type: "push", symbol: "ones_top_left" },
        { type: "push", symbol: "ones_top_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "ones_middle_left_middle_right_visible" },
        { type: "push", symbol: "ones_middle_left" },
        { type: "push", symbol: "ones_middle_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "ones_bottom_left_bottom_right_visible" },
        { type: "push", symbol: "ones_bottom_left" },
        { type: "push", symbol: "ones_bottom_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "ones_top_left_middle_left_visible" },
        { type: "push", symbol: "ones_top_left" },
        { type: "push", symbol: "ones_middle_left" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "ones_middle_left_bottom_left_visible" },
        { type: "push", symbol: "ones_middle_left" },
        { type: "push", symbol: "ones_bottom_left" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "ones_top_right_middle_right_visible" },
        { type: "push", symbol: "ones_top_right" },
        { type: "push", symbol: "ones_middle_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },
        { type: "push", symbol: "ones_middle_right_bottom_right_visible" },
        { type: "push", symbol: "ones_middle_right" },
        { type: "push", symbol: "ones_bottom_right" },
        { type: "equal" },
        { type: "not" },
        { type: "constant", value: true },
        { type: "if" },
        { type: "invariant" },

        // Get the color values for the hundreds nodes.
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "hundreds_top_left" },
        { type: "fetch" },
        { type: "pop", symbol: "hundreds_top_left_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "hundreds_top_right" },
        { type: "fetch" },
        { type: "pop", symbol: "hundreds_top_right_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "hundreds_middle_left" },
        { type: "fetch" },
        { type: "pop", symbol: "hundreds_middle_left_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "hundreds_middle_right" },
        { type: "fetch" },
        { type: "pop", symbol: "hundreds_middle_right_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "hundreds_bottom_left" },
        { type: "fetch" },
        { type: "pop", symbol: "hundreds_bottom_left_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "hundreds_bottom_right" },
        { type: "fetch" },
        { type: "pop", symbol: "hundreds_bottom_right_value" },

        // Get the color values for the tens nodes.
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "tens_top_left" },
        { type: "fetch" },
        { type: "pop", symbol: "tens_top_left_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "tens_top_right" },
        { type: "fetch" },
        { type: "pop", symbol: "tens_top_right_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "tens_middle_left" },
        { type: "fetch" },
        { type: "pop", symbol: "tens_middle_left_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "tens_middle_right" },
        { type: "fetch" },
        { type: "pop", symbol: "tens_middle_right_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "tens_bottom_left" },
        { type: "fetch" },
        { type: "pop", symbol: "tens_bottom_left_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "tens_bottom_right" },
        { type: "fetch" },
        { type: "pop", symbol: "tens_bottom_right_value" },

        // Get the color values for the ones nodes.
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "ones_top_left" },
        { type: "fetch" },
        { type: "pop", symbol: "ones_top_left_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "ones_top_right" },
        { type: "fetch" },
        { type: "pop", symbol: "ones_top_right_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "ones_middle_left" },
        { type: "fetch" },
        { type: "pop", symbol: "ones_middle_left_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "ones_middle_right" },
        { type: "fetch" },
        { type: "pop", symbol: "ones_middle_right_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "ones_bottom_left" },
        { type: "fetch" },
        { type: "pop", symbol: "ones_bottom_left_value" },
        { type: "push", symbol: "colors" },
        { type: "push", symbol: "ones_bottom_right" },
        { type: "fetch" },
        { type: "pop", symbol: "ones_bottom_right_value" },

        // Calculate the total of the hundreds color values.
        { type: "push", symbol: "hundreds_top_left_visible" },
        { type: "push", symbol: "hundreds_top_left_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "hundreds_top_right_visible" },
        { type: "push", symbol: "hundreds_top_right_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "hundreds_middle_left_visible" },
        { type: "push", symbol: "hundreds_middle_left_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "hundreds_middle_right_visible" },
        { type: "push", symbol: "hundreds_middle_right_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "hundreds_bottom_left_visible" },
        { type: "push", symbol: "hundreds_bottom_left_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "hundreds_bottom_right_visible" },
        { type: "push", symbol: "hundreds_bottom_right_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "add" },
        { type: "add" },
        { type: "add" },
        { type: "add" },
        { type: "add" },
        { type: "pop", symbol: "hundreds_total_value" },

        // Calculate the total of the tens color values.
        { type: "push", symbol: "tens_top_left_visible" },
        { type: "push", symbol: "tens_top_left_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "tens_top_right_visible" },
        { type: "push", symbol: "tens_top_right_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "tens_middle_left_visible" },
        { type: "push", symbol: "tens_middle_left_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "tens_middle_right_visible" },
        { type: "push", symbol: "tens_middle_right_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "tens_bottom_left_visible" },
        { type: "push", symbol: "tens_bottom_left_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "tens_bottom_right_visible" },
        { type: "push", symbol: "tens_bottom_right_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "add" },
        { type: "add" },
        { type: "add" },
        { type: "add" },
        { type: "add" },
        { type: "pop", symbol: "tens_total_value" },

        // Calculate the total of the ones color values.
        { type: "push", symbol: "ones_top_left_visible" },
        { type: "push", symbol: "ones_top_left_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "ones_top_right_visible" },
        { type: "push", symbol: "ones_top_right_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "ones_middle_left_visible" },
        { type: "push", symbol: "ones_middle_left_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "ones_middle_right_visible" },
        { type: "push", symbol: "ones_middle_right_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "ones_bottom_left_visible" },
        { type: "push", symbol: "ones_bottom_left_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "push", symbol: "ones_bottom_right_visible" },
        { type: "push", symbol: "ones_bottom_right_value" },
        { type: "constant", value: 0 },
        { type: "if" },
        { type: "add" },
        { type: "add" },
        { type: "add" },
        { type: "add" },
        { type: "add" },
        { type: "pop", symbol: "ones_total_value" },

        // Calculate the total.
        { type: "push", symbol: "hundreds_total_value" },
        { type: "push", symbol: "tens_total_value" },
        { type: "push", symbol: "ones_total_value" },
        { type: "add" },
        { type: "add" },
        { type: "pop", symbol: "total" },

        // Insist that the total equal the original number.
        { type: "push", symbol: "total" },
        { type: "push", symbol: "number" },
        { type: "equal" },
        { type: "invariant" },

        // Expose all the things.
        { type: "variable", symbol: "number" },
        { type: "variable", symbol: "colors" },

        { type: "variable", symbol: "hundreds_top_left_visible" },
        { type: "variable", symbol: "hundreds_top_right_visible" },
        { type: "variable", symbol: "hundreds_middle_left_visible" },
        { type: "variable", symbol: "hundreds_middle_right_visible" },
        { type: "variable", symbol: "hundreds_bottom_left_visible" },
        { type: "variable", symbol: "hundreds_bottom_right_visible" },

        { type: "variable", symbol: "tens_top_left_visible" },
        { type: "variable", symbol: "tens_top_right_visible" },
        { type: "variable", symbol: "tens_middle_left_visible" },
        { type: "variable", symbol: "tens_middle_right_visible" },
        { type: "variable", symbol: "tens_bottom_left_visible" },
        { type: "variable", symbol: "tens_bottom_right_visible" },

        { type: "variable", symbol: "ones_top_left_visible" },
        { type: "variable", symbol: "ones_top_right_visible" },
        { type: "variable", symbol: "ones_middle_left_visible" },
        { type: "variable", symbol: "ones_middle_right_visible" },
        { type: "variable", symbol: "ones_bottom_left_visible" },
        { type: "variable", symbol: "ones_bottom_right_visible" },

        { type: "variable", symbol: "hundreds_top_left_top_right_visible" },
        { type: "variable", symbol: "hundreds_middle_left_middle_right_visible" },
        { type: "variable", symbol: "hundreds_bottom_left_bottom_right_visible" },
        { type: "variable", symbol: "hundreds_top_left_middle_left_visible" },
        { type: "variable", symbol: "hundreds_middle_left_bottom_left_visible" },
        { type: "variable", symbol: "hundreds_top_right_middle_right_visible" },
        { type: "variable", symbol: "hundreds_middle_right_bottom_right_visible" },

        { type: "variable", symbol: "tens_top_left_top_right_visible" },
        { type: "variable", symbol: "tens_middle_left_middle_right_visible" },
        { type: "variable", symbol: "tens_bottom_left_bottom_right_visible" },
        { type: "variable", symbol: "tens_top_left_middle_left_visible" },
        { type: "variable", symbol: "tens_middle_left_bottom_left_visible" },
        { type: "variable", symbol: "tens_top_right_middle_right_visible" },
        { type: "variable", symbol: "tens_middle_right_bottom_right_visible" },

        { type: "variable", symbol: "ones_top_left_top_right_visible" },
        { type: "variable", symbol: "ones_middle_left_middle_right_visible" },
        { type: "variable", symbol: "ones_bottom_left_bottom_right_visible" },
        { type: "variable", symbol: "ones_top_left_middle_left_visible" },
        { type: "variable", symbol: "ones_middle_left_bottom_left_visible" },
        { type: "variable", symbol: "ones_top_right_middle_right_visible" },
        { type: "variable", symbol: "ones_middle_right_bottom_right_visible" },

        { type: "variable", symbol: "hundreds_top_left_value" },
        { type: "variable", symbol: "hundreds_top_right_value" },
        { type: "variable", symbol: "hundreds_middle_left_value" },
        { type: "variable", symbol: "hundreds_middle_right_value" },
        { type: "variable", symbol: "hundreds_bottom_left_value" },
        { type: "variable", symbol: "hundreds_bottom_right_value" },

        { type: "variable", symbol: "tens_top_left_value" },
        { type: "variable", symbol: "tens_top_right_value" },
        { type: "variable", symbol: "tens_middle_left_value" },
        { type: "variable", symbol: "tens_middle_right_value" },
        { type: "variable", symbol: "tens_bottom_left_value" },
        { type: "variable", symbol: "tens_bottom_right_value" },

        { type: "variable", symbol: "ones_top_left_value" },
        { type: "variable", symbol: "ones_top_right_value" },
        { type: "variable", symbol: "ones_middle_left_value" },
        { type: "variable", symbol: "ones_middle_right_value" },
        { type: "variable", symbol: "ones_bottom_left_value" },
        { type: "variable", symbol: "ones_bottom_right_value" }
      ]
    };

    self.machineCode = Sentient.compile(sourceCode);
  };
};

var Digit = function (params) {
  var self = this;

  self.id = params.id;

  var columns = [params.x, params.x + 100];
  var rows = [params.y, params.y + 100, params.y + 200];

  var nodes = [
    new Node({ id: "top_left", x: columns[0], y: rows[0] }),
    new Node({ id: "top_right", x: columns[1], y: rows[0] }),
    new Node({ id: "middle_left", x: columns[0], y: rows[1] }),
    new Node({ id: "middle_right", x: columns[1], y: rows[1] }),
    new Node({ id: "bottom_left", x: columns[0], y: rows[2] }),
    new Node({ id: "bottom_right", x: columns[1], y: rows[2] })
  ];

  var edges = [
    new Edge({ from: nodes[0], to: nodes[1] }),
    new Edge({ from: nodes[2], to: nodes[3] }),
    new Edge({ from: nodes[4], to: nodes[5] }),
    new Edge({ from: nodes[0], to: nodes[2] }),
    new Edge({ from: nodes[2], to: nodes[4] }),
    new Edge({ from: nodes[1], to: nodes[3] }),
    new Edge({ from: nodes[3], to: nodes[5] })
  ];

  var colors = ["#f55", "yellow", "#5cf"];

  self.render = function (context) {
    var i;

    for (i = 0; i < edges.length; i += 1) {
      var edge = edges[i];
      edge.render(context);
    }

    for (i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      node.render(context);
    }
  };

  self.update = function (results) {
    var i, visible, value, id, visibleId, valueId;

    for (i = 0; i < edges.length; i += 1) {
      var edge = edges[i];
      id = self.id + "_" + edge.from.id + "_" + edge.to.id;
      visibleId = id + "_visible";

      visible = results[visibleId];
      edge.visible = visible;
    }

    for (i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      id = self.id + "_" + node.id;
      visibleId = id + "_visible";
      valueId = id + "_value";

      visible = results[visibleId];
      value = results[valueId];

      node.visible = visible;
      node.text = value.toString();

      var colorIndex = results.colors.indexOf(value);
      var color = colors[colorIndex];

      node.color = color;
    }
  };
};

var Node = function (params) {
  var self = this;

  self.id = params.id;
  self.x = params.x;
  self.y = params.y;

  self.color = "gray";
  self.text = "123";
  self.visible = true;

  self.render = function (context) {
    if (!self.visible) {
      return;
    }

    context.save();
    context.beginPath();

    context.lineWidth = 5;
    context.arc(self.x, self.y, 20, 0, 2 * Math.PI);
    context.fillStyle = self.color;
    context.fill();
    context.lineWidth = 3;
    context.stroke();

    context.font = "18px Helvetica";
    context.fillStyle = "black";

    var offset;
    if (self.text.length === 1) {
      offset = -5;
    } else if (self.text.length === 2) {
      offset = -10;
    } else {
      offset = -15;
    }

    context.fillText(self.text, self.x + offset, self.y + 7);

    context.closePath();
    context.restore();
  };
};

var Edge = function (params) {
  var self = this;

  self.from = params.from;
  self.to = params.to;
  self.visible = true;

  self.render = function (context) {
    if (!self.visible) {
      return;
    }

    context.save();
    context.beginPath();

    var gradient = context.createLinearGradient(
      self.from.x,
      self.from.y,
      self.to.x,
      self.to.y
    );

    gradient.addColorStop(0, self.from.color);
    gradient.addColorStop(1, self.to.color);
    context.strokeStyle = gradient;

    context.moveTo(self.from.x, self.from.y);
    context.lineTo(self.to.x, self.to.y);
    context.lineWidth = 20;
    context.stroke();

    context.closePath();
    context.restore();
  };
};

window.Application = Application;
