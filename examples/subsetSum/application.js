/* globals document */
/* jshint maxcomplexity:false */

"use strict";

var Application = function () {
  var self = this;
  var program;

  var numberInputs = [
    document.getElementById("a"),
    document.getElementById("b"),
    document.getElementById("c"),
    document.getElementById("d"),
    document.getElementById("e")
  ];

  var totalInput = document.getElementById("total");

  self.run = function () {
    program = Sentient.compile("                                   \n\
      array5<int20> numbers;                                       \n\
      array5<bool> members;                                        \n\
                                                                   \n\
      total = 0;                                                   \n\
                                                                   \n\
      numbers.each(function^ (number, index) {                     \n\
        total += members[index] ? number : 0;                      \n\
      });                                                          \n\
                                                                   \n\
      expose numbers, members, total;                              \n\
    ");

    self.update();
  };

  self.update = function () {
    var assignments = { numbers: [] };

    for (var i = 0; i < numberInputs.length; i += 1) {
      var inputValue = numberInputs[i].value;

      if (inputValue === "?") {
        assignments.numbers.push(undefined);
      } else {
        var number = parseInt(inputValue, 10);
        assignments.numbers.push(number);
      }
    }

    if (totalInput.value !== "?") {
      assignments.total = parseInt(totalInput.value, 10);
    }

    var result = Sentient.run(program, assignments)[0];

    for (i = 0; i < numberInputs.length; i += 1) {
      var input = numberInputs[i];

      input.style.borderColor = "red";

      if (result.members && result.members[i]) {
        input.style.borderColor = "#0c0";
        input.value = result.numbers[i];
      } else {
        input.style.borderColor = "red";
      }
    }

    if (result.total) {
      totalInput.style.borderColor = "#0c0";
      totalInput.value = result.total;
    } else {
      totalInput.style.borderColor = "red";
    }
  };
};

window.Application = Application;
