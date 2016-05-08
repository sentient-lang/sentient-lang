"use strict";

var CallStack = function (array) {
  var self = this;
  array = array || [];

  self.add = function (functionId, functionName) {
    throwIfStackIsTooDeep();

    var element = { id: functionId, name: functionName };
    var copy = array.slice(0);

    copy.push(element);

    return new CallStack(copy);
  };

  self.toString = function () {
    var strings = [];

    for (var i = array.length - 1; i >= array.length - 20 && i >= 0; i -= 1) {
      var element = array[i];
      var string = " " + elementToString(element) + " ";

      strings.push(string);
    }

    if (array.length > 20) {
      strings.push(" ... (truncated) ");
    }

    padStrings(strings);

    var horizontalRule = Array(strings[0].length + 3).join("-");

    return "|" + strings.join("|\n|") + "|\n" + horizontalRule;
  };

  var throwIfStackIsTooDeep = function () {
    if (array.length === 1000) {
      var message = "Stack level too deep (> 1000). This is probably the";
      message += " result of a recursive function call:\n\n" + self.toString();

      throw new Error(message);
    }
  };

  var elementToString = function (element) {
    return element.name + " (id=" + element.id + ")";
  };

  var padStrings = function (strings) {
    var maxLength, i, string;

    for (i = 0; i < strings.length; i += 1) {
      string = strings[i];

      if (typeof maxLength === "undefined" || string.length > maxLength) {
        maxLength = string.length;
      }
    }

    for (i = 0; i < strings.length; i += 1) {
      string = strings[i];
      var remainingLength = maxLength - string.length;

      strings[i] += Array(remainingLength + 1).join(" ");
    }
  };
};

module.exports = CallStack;
